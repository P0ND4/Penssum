import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fileEvent } from '../helpers/';
import { sendInformationAdmin } from '../../api';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function ImprovementComment({ obtainedFiles, setObtainedFiles }) {
    const [selectValue, setSelectValue] = useState('-- ELIGE UN AREA --');
    const [improvementCommentDescription, setImprovementCommentDescription] = useState('');
    const [sendingInformation,setSendingInformation] = useState(false);

    const navigate = useNavigate();

    const remove = async (currentFile) => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';
        await fileEvent.remove(currentFile, obtainedFiles, setObtainedFiles);
    };

    const uploadFiles = async (files) => {
        if (files.length > 0) {
            const errorHandler = document.querySelector('.publish_error_handler');
            errorHandler.classList.remove('showError');
            errorHandler.textContent = '';

            setSendingInformation(true);
            const result = await fileEvent.uploadFiles(files, 6, obtainedFiles, setObtainedFiles);
            setSendingInformation(false);

            if (result.error) {
                if (result.type === 'Exceeds the number of files allowed') {
                    errorHandler.textContent = 'Solo se acepta un maximo de 6 archivos.';
                    errorHandler.classList.add('showError');
                } else if (result.type === 'some files were not uploaded becuase they break file rules') {
                    errorHandler.innerHTML = `Algunos archivos no fueron subidos.`;
                    errorHandler.classList.add('showError');
                };
            };
        };
    };

    const checkImprovementComment = async () => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        if (selectValue !== '-- ELIGE UN AREA --' &&
            improvementCommentDescription.length >= 50 &&
            improvementCommentDescription.length <= 2000) {
            setSendingInformation(true);
            await sendInformationAdmin({ 
                from: cookies.get('id'), 
                color: 'blue', 
                mainTitle: 'Has recibido un consejo de mejora', 
                title: selectValue, 
                words: 'un comentario de mejora en la parte de',
                description: improvementCommentDescription, 
                files: obtainedFiles
            }); 
            setObtainedFiles(null);
            setSendingInformation(false);
            swal({
                title: '!Exito!',
                text: 'Se ha enviado tu comentario, muchas gracias por apoyarnos y ayudarnos a mejorar a PENSSUM.',
                icon: 'success',
                timer: '3000',
                button: false,
            }).then(() => navigate('/'));
        } else {
            if (improvementCommentDescription.length < 50) errorHandler.textContent = 'Describe mas el area a mejorar.';
            if (improvementCommentDescription.length > 2000) errorHandler.textContent = 'No debe contener mas de 2000 caracteres.';
            if (selectValue === '-- ELIGE UN AREA --') errorHandler.textContent = 'Elije el area a tocar.';
            errorHandler.classList.add('showError');
        };
    }

    return (
        <div className="improvementComment-container">
            <div className="improvementComment">
                <form className="improvementComment-form" onSubmit={e => e.preventDefault()}>
                    <h1 className="improvementComment-title">¿Cómo podemos mejorar?</h1>
                    <div className="improvementComment-divider">
                        <p className="field publish_error_handler" style={{ textAlign: 'justify', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '4px 0' }}></p>
                        <select className="selectImprovement" id="selectImprovement" defaultValue="-- ELIGE UN AREA --" onChange={e => {
                                setSelectValue(e.target.value);
                                const errorHandler = document.querySelector('.publish_error_handler');
                                errorHandler.classList.remove('showError');
                            }}>
                            <option value="-- ELIGE UN AREA --" hidden>-- ELIGE UN AREA --</option>
                            <option value="Anuncios">Anuncios</option>
                            <option value="Barra de navegacion">Barra de navegacion</option>
                            <option value="Barra de navegacion De Usuario">Barra de navegacion De Usuario</option>
                            <option value="Cotizacion">Cotizacion</option>
                            <option value="Configuraciones De Perfil">Configuraciones De Perfil</option>
                            <option value="Grafica">Grafica</option>
                            <option value="Mensajeria">Mensajeria</option>
                            <option value="Ofertar y contraoferta">Ofertar y contraoferta</option>
                            <option value="Perfil">Perfil</option>
                            <option value="Pie de pagina">Pie de pagina</option>
                            <option value="Publicacion de servicio">Publicacion de servicio</option>
                            <option value="Seccion de inicio">Seccion de inicio</option>
                            <option value="Videollamada">Videollamada</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <div className="form-control" style={{ position: 'relative' }}>
                            <textarea placeholder="¿Como podemos mejorar?" id="improvementComment-description" maxLength="2000" value={improvementCommentDescription} onChange={e => {
                                setImprovementCommentDescription(e.target.value);
                                document.getElementById('letter-count-improvementComment-description').textContent = `${e.target.value.length}/2000`;
                                const errorHandler = document.querySelector('.publish_error_handler');
                                errorHandler.classList.remove('showError');
                            }}></textarea>
                            <span id="letter-count-improvementComment-description">0/2000</span>
                        </div>
                        <div className="selected-improvementComment-images-container">
                            {obtainedFiles !== null && (
                                obtainedFiles.map(file => (
                                    <div key={file.uniqueId}>
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
                                )
                            )}
                        </div>
                        <div className="form-control">
                            <label  
                                className="search-image-video-in-improvementComment"
                                htmlFor={!sendingInformation ? "search-image-video-to-improve" : ""}
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                            >Agregar captura de pantalla foto (recomendado)</label>
                            <input type="file" id="search-image-video-to-improve" multiple hidden onChange={e => uploadFiles(e.target.files)} />
                        </div>
                        <p className="improve-opinion">
                            Envíanos tus comentarios si tienes ideas para ayudarnos a mejorar nuestros productos.
                            Si necesitas ayuda para solucionar un problema concreto, <Link to="/help" className="link-help-service">accede al servicio de ayuda</Link>.
                        </p>
                        <p className="improve-warning">Advertencia: cualquier contenido obsceno podria traer como consecuencia la suspencion o el bloqueo de su cuenta.</p>
                        <div className="form-control">
                            <button 
                                id="send-improve" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }} 
                                onClick={() => { if (!sendingInformation) checkImprovementComment() }}
                            >Enviar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImprovementComment;