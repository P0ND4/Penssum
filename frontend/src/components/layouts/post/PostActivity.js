import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { productCreate, getCoupons, couponControl } from '../../../api';
import { fileEvent, thousandsSystem, getRemainTime } from '../../helpers';
import PayuForm from '../../parts/PayuForm';
import swal from 'sweetalert';
import Information from '../../parts/Information';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function PostActivity({ userInformation, obtainedFiles, setObtainedFiles, isTheUserSuspended, username }) {
    const [field, setField] = useState({
        customCategory: false,
        title: false,
        description: false,
        category: false,
        subCategory: false
    });
    const [data, setData] = useState({
        category: '',
        subCategory: '',
        customCategory: '',
        title: '',
        description: '',
        dateOfDelivery: '',
        videoCallActivated: false,
        paymentMethod: false,
        advancePayment: false
    });
    const [sendingInformation,setSendingInformation] = useState(false);
    const [valueString,setValueString] = useState('');
    const [valueNumber,setValueNumber] = useState(0);
    const [paymentHandler,setPaymentHandler] = useState(false);
    const [activatePayment,setActivatePayment] = useState(false);
    const [activateInformation,setActivateInformation] = useState(false);
    const [payForPenssum,setPayForPenssum] = useState(false);

    //Coupon

    const [coupon,setCoupon] = useState(null);
    const [couponText,setCouponText] = useState(''); 
    const [errorCoupon,setErrorCoupon] = useState(0);
    const [incrementError,setIncrementError] = useState(15000);
    const [timerError,setTimerError] = useState(null);

    const timerErrorRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        if (errorCoupon === 3 || timerError) {
            setErrorCoupon(0);
            if (!timerError) {
                const currentDate = new Date();
                const TimeInMilliseconds = currentDate.getTime();
                const newDate = new Date(TimeInMilliseconds + incrementError);

                setTimerError(getRemainTime(newDate));
                timerErrorRef.current = setInterval(() => setTimerError(getRemainTime(newDate)),1000);
                const newIncrement = incrementError * 2;
                setIncrementError(newIncrement);
            };

            if (timerError && timerError.remainTime <= 1) {
                clearInterval(timerErrorRef.current);
                setTimerError(null);
            };
        };
    },[errorCoupon,timerError,incrementError]);

    const saveProduct = useCallback(
        async advancePayment => {
            const activityData = {
                owner: userInformation._id,
                creatorUsername: userInformation.username,
                category: data.category,
                subCategory: data.subCategory,
                customCategory: data.customCategory.trimEnd(),
                title: data.title.trimEnd(),
                description: data.description.trimEnd(),
                valueNumber: !valueNumber ? 0 : valueNumber,
                valueString,
                advancePayment,
                paymentTOKEN: advancePayment === undefined ? paymentHandler.token : null,
                paymentLink: advancePayment === undefined ? paymentHandler.URL : null,
                paymentType: paymentHandler.paymentType ? paymentHandler.paymentType : null,
                dateOfDelivery: data.dateOfDelivery,
                videoCall: data.videoCallActivated,
                paymentMethod: data.paymentMethod,
                city: userInformation.city === 'city' || !userInformation.city ? null : userInformation.city,
                files: obtainedFiles
            };

            setSendingInformation(true);
            if (obtainedFiles !== null) await productCreate(activityData);
            if (coupon) await couponControl({ id_coupon: coupon._id, username: userInformation.username });
            setSendingInformation(false);
            setObtainedFiles(null);
            navigate(`/${userInformation.username}`);
        },[data,userInformation,navigate,valueNumber,valueString,obtainedFiles,setObtainedFiles,paymentHandler,coupon]
    );

    useEffect(() => {
        if (!cookies.get('pay-for-penssum')) setPayForPenssum(true);
    },[]);

    useEffect(() => {
        if (activatePayment) document.querySelector('body').style.overflow = 'hidden'
        else document.querySelector('body').style.overflow = 'auto';
    });

    useEffect(() => {
        if (paymentHandler.response || paymentHandler.response === 'pendding') { saveProduct(paymentHandler.response === true ? true : paymentHandler.response === 'pendding' ? undefined : false) };
    },[paymentHandler, saveProduct]);

    const activityValidation = {
        textLimit: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
        description: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{30,120}$/,
        value: /^[0-9.]{0,20}$/,
    };

    const validateField = (expression, input) => {
        if (expression.test(input.value.trimEnd())) {
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
            [e.target.name]: e.target.value.trimStart()
        });

        const targetName = e.target.name;
        const input = e.target;

        if (targetName === "customCategory") { validateField(activityValidation.textLimit, input) };
        if (targetName === "title") { validateField(activityValidation.textLimit, input) };
        if (targetName === "description") { validateField(activityValidation.description, input) };
        if (targetName === "value") { validateField(activityValidation.value, input) };
    };

    const uploadFiles = async files => {
        if (files.length > 0) {
            const error = document.querySelector('.field_fill_in_fields_post_activity');
            error.classList.remove('showError');
            error.textContent = '';

            const errorHandler = document.querySelector('.publish_error_handler');
            errorHandler.classList.remove('showError');
            errorHandler.textContent = '';

            setSendingInformation(true);
            const result = await fileEvent.uploadFiles(files, 10, obtainedFiles, setObtainedFiles);
            setSendingInformation(false);

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
                };
            };
        };
    };

    const remove = async (currentFile) => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');

        await fileEvent.remove(currentFile, obtainedFiles, setObtainedFiles);
    };

    const createActivity = async () => {
        const error = document.querySelector('.field_fill_in_fields_post_activity');
        error.classList.remove('showError');
        error.textContent = '';

        if (field.category && field.subCategory && field.customCategory && field.title && field.description && data.dateOfDelivery) {
            if (obtainedFiles !== null) {
                if ((data.advancePayment && valueNumber > 0 && valueNumber) || (coupon !== null && valueNumber > coupon.amount)) {
                    if (valueNumber >= 20000 && valueNumber <= 750000) setActivateInformation(true)
                    else {
                        swal({
                            title: 'OOPS',
                            text: 'El mónto mínimo que se puede transferir vía PENSSUM es de 20.000 COP hasta un máximo de 750.000 COP.',
                            icon: 'info',
                            button: 'Gracias',
                        });
                    };
                } else setActivateInformation(true);
            } else {
                error.textContent = 'Suba al menos una imagen.';
                error.classList.add('showError');
            }
        } else {
            if (!data.dateOfDelivery) error.textContent = `Ingrese una fecha.`;
            if (!field.description) error.textContent = `Rellene el campo de la descripcion.`;
            if (!field.title) error.textContent = `Rellene el campo del titulo.`;
            if (!field.customCategory) error.textContent = `Rellene el campo de la categoria personalizada.`;
            if (!field.subCategory) error.textContent = `Rellene el campo de la subcategoria.`;
            if (!field.category) error.textContent = `Rellene el campo de categoria.`;

            error.classList.add('showError');
        };
    };

    const getCoupon = async () => {
        const coupon = await getCoupons({ text: couponText, username: userInformation.username });

        if (coupon.error) {
            swal({
                title: '!OOPS!',
                text: coupon.type === 'the coupon don`t exists' ? 'No se encontro el cupon.' : coupon.type === 'coupon expired' ? 'El cupon expiró.' : 'Ya usó el cupon',
                icon: 'error',
                button: 'Gracias',
            });
            if (coupon.type === 'the coupon don`t exists') setErrorCoupon(errorCoupon + 1);
        } else {
            setCoupon(coupon);
            setIncrementError(15000);
            setErrorCoupon(0);
            setValueNumber(coupon.amount);
            setValueString(coupon.amount >= 1000 ? thousandsSystem(coupon.amount) : coupon.amount);
            setData({ ...data, advancePayment: false });
            swal({
                title: '!EXCELENTE!',
                text: 'Cupon agregado correctamente.',
                icon: 'success',
                button: false,
                timer: '2000'
            });
        };
    };

    return !isTheUserSuspended ? (
        <div className="post-activity-container">
            <div className="post-activity">
                <section className="post-photos-container">
                    <div className="container-to-upload-photos">
                        <p className="field publish_error_handler" id="publish_error_handler-file" style={{ textAlign: 'justify', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '2px 0' }}></p>
                        {/*<p>SEREAL: SDJ1232SAS</p>*/}
                        <label 
                            htmlFor={!sendingInformation ? "search-image" : ""}
                            style={{ 
                                background: sendingInformation ? '#3282B8' : '', 
                                opacity: sendingInformation ? '.4' : '', 
                                cursor: sendingInformation ? 'not-allowed' : '' 
                            }}
                        >Seleccionar Imagenes</label>
                        {/*<p className="post-subtitle">O Suelta las imagenes aqui</p>*/}
                        <input type="file" id="search-image" name="files" multiple hidden onChange={e => { if (!sendingInformation) uploadFiles(e.target.files) }} />
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
                    <div>
                        <h1 className="post-form-containert-title">CREA UNA PUBLICACION</h1>
                    </div>
                    <form onSubmit={e => e.preventDefault()} >
                        {coupon && (
                            <div className="coupon-applied-container">
                                <div className="coupon-applied">
                                    <img src="/img/penssum-transparent.png" alt="penssum-icon"/>
                                    <p>{coupon.name}</p>
                                </div>
                                <p>Cupon agregado correctamente</p>
                                <p>Cupon de: <span>${coupon.amount >= 1000 ? thousandsSystem(coupon.amount) : coupon.amount}</span></p>
                            </div>
                        )}
                        <div className="form-control form-control-select">
                            <select id="main-post-category" defaultValue="category" onChange={e => {
                                setData({ ...data, category: e.target.value });
                                setField({ ...field, category: true });
                            }}>
                                <option value="category" hidden>CATEGORIA</option>
                                {/*userInformation.objetive === 'Profesor' && <option value="Curso">CURSO...</option>*/}
                                {/*userInformation.objetive === 'Profesor' && <option value="Tutoria">TUTORIA...</option>*/}
                                {/*userInformation.objetive === 'Alumno' && <option value="Resolver">RESOLVER...</option>*/}
                                {/*userInformation.objetive === 'Alumno' && <option value="Explicar">EXPLICAR...</option>*/}
                                {userInformation.objetive === 'Alumno' && <option value="Virtual">VIRTUAL...</option>}
                                {userInformation.objetive === 'Alumno' && <option value="Presencial">PRESENCIAL...</option>}
                                {userInformation.objetive === 'Alumno' && <option value="Ambos">AMBOS</option>}
                                {/*<option value="Otros">OTROS</option>*/}
                            </select>
                        </div>
                        <div className="form-control form-control-select" onChange={e => {
                            setData({ ...data, subCategory: e.target.value });
                            setField({ ...field, subCategory: true });
                        }}>
                            <select id="main-post-subcategory" defaultValue="subcategory">
                                <option value="subcategory" hidden>SUBCATEGORIA</option>
                                <option value="Facultad ingenieria">FACULTAD INGENIERÍA</option>
                                <option value="Otros">OTRO</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <input type="text" name="customCategory" placeholder="ASIGNATURA (Calculo Diferencial)" value={data.customCategory} onChange={changeEvent} />
                            <p className="field field_customCategory">El nombre no puede superar los 30 ni tener menos de 3 caracteres, tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="text" name="title" value={data.title} placeholder="TEMA (Derivadas)" onChange={changeEvent} />
                            <p className="field field_title">El nombre no puede superar los 30 ni tener menos de 3 caracteres, tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <div className="post-description-abbreviation">
                                <textarea name="description" placeholder="Necesito urgentemente a alguien me explique o me resuelva las integrales." maxLength="120" value={data.description} onChange={e => {
                                    changeEvent(e);
                                    document.getElementById('letter-counter').textContent = `${e.target.value.length}/120`;
                                }}></textarea>
                                <span id="letter-counter">0/120</span>
                            </div>
                            <p className="field field_description">La descripcion no puede superar los 120 caracteres o tener menos de 30 ni numeros o caracteres extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="text" name="value" value={valueString} id="post-product-price" placeholder="Introduzca el valor del producto en pesos Colombianos (COP)" onChange={e => {
                                var num = e.target.value.replace(/\./g,'');

                                if(!isNaN(num)){
                                    if ((!coupon || (coupon && parseInt(num) >= coupon.amount)) && num.length <= 10) {
                                        setValueNumber(parseInt(e.target.value.replace(/\./g, '')));
                                        num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
                                        num = num.split('').reverse().join('').replace(/^[.]/,'');
                                        setValueString(num);
                                    };
                                } else setValueString(e.target.value.replace(/[^\d.]*/g,''));

                                changeEvent(e)
                            }} />
                            <p className="field field_value">El valor no puede contener letras ni superar los 20 digitos.</p>
                        </div>
                        <div className="pay-options-container">
                            {userInformation.objetive === 'Profesor' && (
                                <section className="pay-options-title-container">
                                    <p className="pay-options-title">Integrar pago en el servicio</p>
                                    <i className="far fa-question-circle">
                                        <div className="pay-options-information">
                                        <p> 
                                            Si seleccionas el metodo de pago necesitaremos verificar su informacion 
                                            bancaria para la transaccion, puede entrar en configuracion, pagos he ingresar
                                            sus datos, de lo contrario no podremos
                                            enviarle el dinero del servicio, recuerde que si no activa la pasarela
                                            de pago, debe llegar a un acuerdo sobre el pago con el cliente.
                                        </p>
                                    </div>
                                    </i>
                                </section>
                            )}
                            {userInformation.objetive === 'Profesor' && (
                                <section className="pay-options"
                                    onClick={() => setData({ 
                                        ...data, 
                                        paymentMethod: !data.paymentMethod 
                                    })}>
                                    <img src="/img/payu.png" alt="payu"/>
                                    <button className="pay-options-button">
                                        <div style={{ 
                                            transform: !data.paymentMethod ? 'translateX(0)' : 'translateX(33px)',
                                            background: !data.paymentMethod ? '#283841' : '#3282B8'
                                        }}>{!data.paymentMethod ? 'No' : 'Si'}</div>
                                    </button>
                                </section>
                            )}
                        </div>
                        {(userInformation.objetive === 'Alumno' && valueNumber > 0 && valueNumber && !coupon) && (
                            <div className="advancePayment-option-container">    
                                <div className="advancePayment-option">
                                    <span>¿Quieres pagar a través de PENSSUM?</span>
                                    <p>Compra Protegida tendrás el respaldo y la garantía.</p>
                                </div>
                                <button 
                                    className="integrate-advancePayment-button"
                                    onClick={() => setData({ 
                                        ...data, 
                                        advancePayment: !data.advancePayment 
                                    })}
                                    style={{
                                        boxShadow: !data.advancePayment ? '' : '#3282B8 0px 7px 29px 0px'
                                    }}>
                                    <div style={{ 
                                        transform: !data.advancePayment ? 'translateX(0)' : 'translateX(33px)',
                                        background: !data.advancePayment ? '#283841' : '#3282B8'
                                    }}>{!data.advancePayment ? 'No' : 'Si'}</div>
                                </button>
                            </div>
                        )}
                        {/*<div className="video_call-option-container">    
                            <div className="video_call-option">
                                <span>¿Quieres integrar la videollamada?</span>
                                <p>Si necesitas una explicación más detallada en tus necesidades academícas.</p>
                            </div>
                            <button 
                                className="integrate-video_call-button"
                                onClick={() => setData({ 
                                    ...data, 
                                    videoCallActivated: !data.videoCallActivated 
                                })}
                                style={{
                                    boxShadow: !data.videoCallActivated ? '' : '#3282B8 0px 7px 29px 0px'
                                }}>
                                <div style={{ 
                                    transform: !data.videoCallActivated ? 'translateX(0)' : 'translateX(33px)',
                                    background: !data.videoCallActivated ? '#283841' : '#3282B8'
                                }}>{!data.videoCallActivated ? 'No' : 'Si'}</div>
                            </button>
                        </div>*/}
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
                    {!coupon && (
                        <section className="coupon-zone-container">
                            <p className="coupon-zone-title">¿Tienes un cupon?</p>
                            <div className="coupon-zone-selection">
                                <input type="text" value={couponText} onChange={e => setCouponText(e.target.value.trim())} placeholder="Ingresa el cupon aqui"/>
                                <button 
                                    style={{ 
                                        background: timerError ? '#3282B8' : '', 
                                        opacity: timerError ? '.4' : '', 
                                        cursor: timerError ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => couponText && !timerError && getCoupon()}
                                >Validar</button>
                            </div>
                            {timerError && <p className="coupon-zone-locked">Tiempo de bloqueo: {timerError.remainHours}:{timerError.remainMinutes}:{timerError.remainSeconds}</p>}
                        </section>
                    )}
                </section>
            </div>
            {activatePayment && (
                <PayuForm
                    title={coupon ? 'DIFERENCIA DEL PAGO' : "PAGO ADELANTADO"}
                    amount={coupon ? valueNumber - coupon.amount : valueNumber}
                    userInformation={userInformation}
                    productTitle={data.title}
                    paymentHandler={setPaymentHandler}
                    setActivatePayment={setActivatePayment}
                    payment={coupon ? { card: true, pse: false, bank: false, cash: false } : { card: true, pse: true, bank: true, cash: true }}
                />
            )}
            {activateInformation && (
                <Information 
                    userInformation={userInformation}
                    callback={data.advancePayment || (coupon !== null && valueNumber > coupon.amount) ? setActivatePayment : saveProduct}
                    callbackValue={data.advancePayment || coupon !== null ? true : false}
                    controller={setActivateInformation}
                />
            )}
            {payForPenssum && (
                <div className="payForPenssum-container">
                    <div className="payForPenssum">
                        <h1>!HOLA QUERID@ {userInformation.firstName}!</h1>
                        <h3>PAGA A TRAVÉS DE PENSSUM</h3>
                        <p>La ventaja de realizar el pago de tus necesidades académicas a través de PENSSUM.</p>
                        <ul>
                            <li><i className="fa fa-check"></i> Serán realizadas en el tiempo solicitado</li>
                            <li><i className="fa fa-check"></i> Las actividades tendrán la calidad requerida</li>
                            <li><i className="fa fa-check"></i> Una explicación muy detallada</li>
                            <li><i className="fa fa-check"></i> Tendrá la confianza de los profesores de penssum</li>
                            <li><i className="fa fa-check"></i> Tu dinero estará seguro</li>
                        </ul>
                        <p>Una vez cumplida tus expectativas será desembolsado el dinero al profesor.</p>
                        <div className="payForPenssum-button-container">
                            <button onClick={() => {
                                setPayForPenssum(false);
                                const date = new Date();
                                const expires = new Date(date.setDate(date.getDate() + 5));
                                cookies.set('pay-for-penssum', true,{ path: '/post/activity', expires });
                            }}>!Gracias!</button>
                        </div>
                    </div>                
                </div>
            )}
        </div>
    ) : <Navigate to={`/${username}`}/>;
};

export default PostActivity;