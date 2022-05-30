import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { productCreate, removeFiles } from '../../../api';
import { fileEvent } from '../../helpers';

function PostActivity({ userInformation, obtainedFiles, setObtainedFiles, isTheUserSuspended, username }) {
    const [field, setField] = useState({
        customCategory: false,
        title: false,
        description: false,
        category: false,
        subCategory: false,
    });

    const [data, setData] = useState({
        category: '',
        subCategory: '',
        customCategory: '',
        title: '',
        description: '',
        value: '',
        dateOfDelivery: '',
        videoCallActivated: false,
        paymentMethod: false
    });
    const [sendingInformation,setSendingInformation] = useState(false);

    const navigate = useNavigate();

    const removeAllFiles = async () => {
        await removeFiles({ files: obtainedFiles });
        setObtainedFiles(null);
    };

    useEffect(() => {
        if (obtainedFiles !== null) window.addEventListener("beforeunload", event => event.returnValue = '');
        if (obtainedFiles !== null) window.addEventListener("unload", removeAllFiles);
        return (() => {
            window.removeEventListener("beforeunload", event => event.returnValue = '')
            window.removeEventListener("unload", removeAllFiles);
        });
    });

    const activityValidation = {
        textLimit: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
        description: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{20,120}$/,
        value: /^[0-9]{0,20}$/,
    };

    const validateField = (expression, input) => {
        if (expression.test(input.value)) {
            document.querySelector(`.field_${input.name}`).classList.remove('showError');
            setField({
                ...field,
                [input.name]: true
            });
        }
        else {
            (input.value === '')
                ? document.querySelector(`.field_${input.name}`).classList.remove('showError')
                : document.querySelector(`.field_${input.name}`).classList.add('showError');
            setField({
                ...field,
                [input.name]: false
            });
        };
    };

    const changeEvent = e => {
        const error = document.querySelector('.field_fill_in_fields_post_activity');
        error.classList.remove('showError');
        error.textContent = '';

        setData({
            ...data,
            [e.target.name]: e.target.value
        });

        const targetName = e.target.name;
        const input = e.target;

        if (targetName === "customCategory") { validateField(activityValidation.textLimit, input) };
        if (targetName === "title") { validateField(activityValidation.textLimit, input) };
        if (targetName === "description") { validateField(activityValidation.description, input) };
        if (targetName === "value") { validateField(activityValidation.value, input) };
    };

    const uploadFiles = async files => {
        const error = document.querySelector('.field_fill_in_fields_post_activity');
        error.classList.remove('showError');
        error.textContent = '';

        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        const result = await fileEvent.uploadFiles(files, 10, obtainedFiles, setObtainedFiles);

        if (result.error) {
            if (result.type === 'Exceeds the number of files allowed') {
                errorHandler.textContent = 'Solo se acepta un maximo de 10 archivos.';
                errorHandler.classList.add('showError');
            } else if (result.type === 'some files were not uploaded becuase they break file rules') {
                errorHandler.innerHTML = `
                    Algunos archivos no fueron subidos. 
                    verifique: <br/> 1) El tamaño no puede superar los 5MB <br/>
                                 2) Suba imagenes o documentos nada mas.
                `;
                errorHandler.classList.add('showError');
            }
        }
    }

    const remove = async (currentFile) => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');

        await fileEvent.remove(currentFile, obtainedFiles, setObtainedFiles);
    };

    const createActivity = async () => {
        const error = document.querySelector('.field_fill_in_fields_post_activity');
        error.classList.remove('showError');
        error.textContent = '';

        if (field.category && field.customCategory && field.description && field.subCategory && field.title) {
            if (obtainedFiles !== null) {
                const activityData = {
                    owner: userInformation._id,
                    creatorUsername: userInformation.username,
                    category: data.category,
                    subCategory: data.subCategory,
                    customCategory: data.customCategory,
                    title: data.title,
                    description: data.description,
                    value: data.value,
                    dateOfDelivery: data.dateOfDelivery,
                    videoCall: data.videoCallActivated,
                    paymentMethod: data.paymentMethod,
                    files: obtainedFiles
                };

                setSendingInformation(true);
                await productCreate(activityData);
                setSendingInformation(false);
                setObtainedFiles(null);
                navigate(`/${userInformation.username}`);
            } else {
                error.textContent = 'Suba al menos una imagen.';
                error.classList.add('showError');
            }
        } else {
            error.textContent = 'Rellene los campos.';
            error.classList.add('showError');
        };
    };

    return !isTheUserSuspended ? (
        <div className="post-activity-container">
            <div className="post-activity">
                <section className="post-photos-container">
                    <div className="container-to-upload-photos">
                        <p className="field publish_error_handler" style={{ textAlign: 'justify', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '2px 0' }}></p>
                        {/*<p>SEREAL: SDJ1232SAS</p>*/}
                        <label htmlFor="search-image">Seleccionar Imagenes</label>
                        {/*<p className="post-subtitle">O Suelta las imagenes aqui</p>*/}
                        <input type="file" id="search-image" name="files" multiple hidden onChange={e => uploadFiles(e.target.files)} />
                    </div>
                    <div className="uploaded-photo-container">
                        {obtainedFiles !== null
                            ? obtainedFiles.map(file => <div key={file.uniqueId}>
                                <span className="clearFile" onClick={() => remove({ fileName: file.fileName })}>x</span>
                                <a href={file.url} rel="noreferrer" target="_blank">
                                    <img src={
                                        (file.extname === '.pdf')
                                            ? '/img/pdf_image.svg'
                                            : (file.extname === '.doc' || file.extname === '.docx')
                                                ? '/img/word_image.svg'
                                                : (file.extname === '.epub' || file.extname === '.azw' || file.extname === '.ibook')
                                                    ? '/img/document_image.svg'
                                                    : file.url
                                    }
                                        referrerPolicy="no-referrer"
                                        alt="selected_image"
                                    />
                                </a>
                            </div>)
                            : <></>}
                    </div>
                </section>
                <section className="post-form-container">
                    <h1 className="post-form-containert-title">CREA UNA PUBLICACION</h1>
                    <form onSubmit={e => e.preventDefault()} >
                        <div className="form-control form-control-select">
                            <select id="main-post-category" defaultValue="category" onChange={e => {
                                setData({ ...data, category: e.target.value });
                                setField({ ...field, category: true });
                            }}>
                                <option value="category" hidden>CATEGORIA</option>
                                <option value="Resolver">RESOLVER...</option>
                                <option value="Explicar">EXPLICAR...</option>
                                <option value="Tutoria">TUTORIA...</option>
                                <option value="Curso">CURSO...</option>
                                <option value="Otros">OTROS</option>
                            </select>
                        </div>
                        <div className="form-control form-control-select" onChange={e => {
                            setData({ ...data, subCategory: e.target.value });
                            setField({ ...field, subCategory: true });
                        }}>
                            <select id="main-post-subcategory" defaultValue="subcategory">
                                <option value="subcategory" hidden>SUBCATEGORIA</option>
                                <option value="Facultad ingenieria">FACULTAD INGENIERIA</option>
                                <option value="Facultad arquitectura">FACULTAD ARQUITECTURA</option>
                                <option value="Facultad ciencias">FACULTAD CIENCIAS</option>
                                <option value="Facultad ciencias politicas y sociales">FACULTAD CIENCIAS POLITICAS Y SOCIALES</option>
                                <option value="Facultad contaduria y administracion">FACULTAD CONTADURIA Y ADMINISTRACION</option>
                                <option value="Facultad derecho">FACULTAD DERECHO</option>
                                <option value="Facultad economia">FACULTAD ECONOMIA</option>
                                <option value="Facultad filosofia y letras">FACULTAD FILOSOFIA Y LETRAS</option>
                                <option value="Facultad medicina">FACULTAD MEDICINA</option>
                                <option value="Facultad medicina veterinaria y zootecnia">FACULTAD MEDICINA VETERINARIA Y ZOOTECNIA</option>
                                <option value="Facultad musica">FACULTAD MUSICA</option>
                                <option value="Facultad odontologia">FACULTAD ODONTOLOGIA</option>
                                <option value="Facultad psicologia">FACULTAD PSICOLOGIA</option>
                                <option value="Facultad quimica">FACULTAD QUIMICA</option>
                                <option value="Facultad turismo">FACULTAD TURISMO</option>
                                <option value="Otros">OTRO</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <input type="text" name="customCategory" placeholder="Crea una subcategoria personalizada (CALCULO DIFERENCIAL)" onChange={changeEvent} />
                            <p className="field field_customCategory">El nombre no puede superar los 30 ni tener menos de 3 caracteres, tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="text" name="title" placeholder="Titulo Breve (INTEGRALES)" onChange={changeEvent} />
                            <p className="field field_title">El nombre no puede superar los 30 ni tener menos de 3 caracteres, tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <div className="post-description-abbreviation">
                                <textarea name="description" placeholder="Necesito urgentemente a alguien me explique o me resuelva las integrales." maxLength="120" onChange={e => {
                                    changeEvent(e);
                                    document.getElementById('letter-counter').textContent = `${e.target.value.length}/120`;
                                }}></textarea>
                                <span id="letter-counter">0/120</span>
                            </div>
                            <p className="field field_description">La descripcion no puede superar los 120 caracteres o tener menos de 20 ni numeros o caracteres extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="number" name="value" id="post-product-price" placeholder="Introduzca el valor del producto en pesos Colombianos (COP)" onChange={changeEvent} />
                            <p className="field field_value">El valor no puede superar los 20 caracteres.</p>
                        </div>
                        <div className="pay-options-container">
                            <section className="pay-options-title-container">
                                <p className="pay-options-title">Integrar pago en el servicio</p>
                                <i className="far fa-question-circle">
                                    <div className="pay-options-information">
                                    <p> 
                                        Si seleccionas el metodo de pago necesitaremos verificar su informacion 
                                        bancaria para la transaccion, puede entrar en configuracion > pagos he ingresar
                                        sus datos, de lo contrario no podremos
                                        enviarle el dinero del servicio, recuerde que si no activa la pasarela
                                        de pago, debe llegar a un acuerdo sobre el pago con el cliente.
                                    </p>
                                </div>
                                </i>
                            </section>
                            <section className="pay-options" 
                                onClick={() => setData({ 
                                    ...data, 
                                    paymentMethod: !data.paymentMethod 
                                })}>
                                <button style={{ 
                                    background: !data.paymentMethod ? 'transparent' : '#3282B8',
                                    border: !data.paymentMethod ? '1px solid #444' : 'transparent'
                                }}></button>
                                <img src="/img/payu.png" alt="payu"/>
                            </section>
                        </div>
                        <div className="video_call-option-container">    
                            <p style={{ color: !data.videoCallActivated ? '#666666' : '#3282B8' }}>{!data.videoCallActivated ? 'No' : 'Si'}</p>
                            <button style={{ 
                                    background: !data.videoCallActivated ? 'transparent' : '#3282B8',
                                    border: !data.videoCallActivated ? '1px solid #444' : 'transparent'
                                }} 
                                 onClick={() => setData({ 
                                    ...data, 
                                    videoCallActivated: !data.videoCallActivated 
                                })}></button>
                            <span>¿Quieres integrar la videollamada?</span>
                        </div>
                        <div className="post-product-data">
                            <div className="dateOfDelivery">
                                <label>Ingrese la fecha de entrega: </label>
                                <input type="date" min="2022-01-01" max="2025-01-01" value={data.dateOfDelivery} onChange={e => setData({
                                    ...data,
                                    dateOfDelivery: e.target.value
                                })} />
                            </div>
                        </div>
                        <div className="form-control">
                            <div className="post-button-container">
                                <Link id="goToProfile" to={`/${userInformation.username}`}>Ir al perfil</Link>
                                <button 
                                    id="publish" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }} 
                                    onClick={() => { if (!sendingInformation) createActivity() }}
                                >Publicar</button>
                            </div>
                        </div>
                        <p className="field field_fill_in_fields_post_activity" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}></p>
                    </form>
                </section>
            </div>
        </div>
    ) : <Navigate to={`/${username}`}/>;
};

export default PostActivity;