import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { sendQuote, socket, getProducts } from '../../../api';
import { fileEvent } from '../../helpers';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Quote({ obtainedFiles, setObtainedFiles, isTheUserSuspended, username, quoteId, setQuoteId }) {
    const [sendingInformation,setSendingInformation] = useState(false);

    const navigate = useNavigate();

    const uploadFiles = async files => {
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

    const handlerQuote = async () => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        if (quoteId !== '') {
            if (quoteId.length === 24) {
                if (obtainedFiles !== null) {
                    setSendingInformation(true);
                    const result = await sendQuote(cookies.get('id'), quoteId.trim(), obtainedFiles);
                    setSendingInformation(false);
                    document.getElementById('sereal-id').value = '';

                    if (result.error) {
                        if (result.type === 'the product not exists') {
                            swal({
                                title: 'OOPS',
                                text: 'La publicacion no existe :(',
                                icon: 'error',
                                button: true
                            });
                        };

                        if (result.type === 'you cannot send a quote to a blocked user') {
                            swal({
                                title: 'Error',
                                text: result.data[0].from === cookies.get('id') ? 'No puedes enviar una actividad a un usuario que has bloqueado.' : 'No puedes enviar una actividad a un usuario que te ha bloqueado.',
                                icon: 'error',
                                button: true
                            });
                        };

                        if (result.type === 'you cannot send a activity to yourself') {
                            swal({
                                title: 'Error',
                                text: 'No puedes enviar una actividad a ti mismo.',
                                icon: 'error',
                                button: true
                            });
                        };

                        if (result.type === 'you cannot send a activity that does not belong to you') {
                            swal({
                                title: 'LO SENTIMOS :(',
                                text: 'No puedes enviar una actividad que no hayas tomado.',
                                icon: 'info',
                                button: true
                            });
                        };
                    } else {
                        const product = await getProducts({ id: quoteId });
                        socket.emit('product updated', { userID: product.owner, product });
                        socket.emit('received event', null, quoteId);
                        swal({
                            title: 'Enviado',
                            text: 'La actividad ha sido enviada, espere la respuesta del dueño.',
                            icon: 'success',
                            timer: '3000',
                            button: false
                        }).then(() => navigate(`/post/information/${quoteId}`));
                        setObtainedFiles(null);
                    }
                    setQuoteId('');
                    return;
                };
                errorHandler.textContent = 'Selecciones archivos o documentos a enviar.';
                errorHandler.classList.add('showError');
                return;
            }
            errorHandler.textContent = 'Identificacion de producto invalida';
            errorHandler.classList.add('showError');
            return;
        };

        errorHandler.textContent = 'Copie y pegue el id del servicio para continuar.';
        errorHandler.classList.add('showError');
        return;
    };

    return !isTheUserSuspended ? (
        <div className="quote-container">
            <div className="quote">
                <div className="quote-form">
                    <div className="quote-information-container">
                        <img src="/img/illustration/files-sent.svg" alt="send-file" />
                        <p>Envia el documento de la actividad.</p>
                    </div>
                    <p className='field publish_error_handler' style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '10px 0' }}></p>
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
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="form-control ">
                            <div className="quote-file-zone">
                                <label 
                                    htmlFor={sendingInformation ? '' : "quote-file"}
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                >Seleccione las Imagenes/Archivos</label>
                                <input type="file" id="quote-file" multiple hidden onChange={e => uploadFiles(e.target.files)} />
                            </div>
                        </div>
                        <div className="quote-section">
                            <div className="form-control">
                                <input id="sereal-id" type="text" placeholder="Escriba El SERIAL OT o el id del producto" value={quoteId} onChange={e => setQuoteId(e.target.value)} />
                            </div>
                            <div className="form-control">
                                <button 
                                    id="send-quote" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => { if (!sendingInformation) handlerQuote() }}>Enviar Actividad</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    ) : <Navigate to={`/${username}`}/>;
};

export default Quote;