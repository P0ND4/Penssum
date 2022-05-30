import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { sendQuote, socket } from '../../../api';
import { fileEvent } from '../../helpers';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Quote({ obtainedFiles, setObtainedFiles, isTheUserSuspended, username }) {
    const [id, setId] = useState('');

    const navigate = useNavigate();

    const uploadFiles = async files => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        const result = await fileEvent.uploadFiles(files, 6, obtainedFiles, setObtainedFiles);

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
            }
        }
    }

    const remove = async (currentFile) => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');

        await fileEvent.remove(currentFile, obtainedFiles, setObtainedFiles);
    };

    const handlerQuote = async () => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        if (id !== '') {
            if (id.length === 24) {
                if (obtainedFiles !== null) {
                    const result = await sendQuote(cookies.get('id'), id, obtainedFiles);
                    document.getElementById('sereal-id').value = '';
                    setId('');

                    socket.emit('received event', null, id);

                    if (result.error) {
                        if (result.type === 'you cannot send a quote to a blocked user') {
                            swal({
                                title: 'Error',
                                text: result.data[0].from === cookies.get('id') ? 'No puedes enviar una cotizacion a un usuario que has bloqueado.' : 'No puedes enviar una cotizacion a un usuario que te ha bloqueado.',
                                icon: 'error',
                                button: true
                            });
                        } else {
                            swal({
                                title: 'Error',
                                text: 'No puedes enviar una cotizacion a ti mismo.',
                                icon: 'error',
                                button: true
                            });
                        };
                    } else {
                        swal({
                            title: 'Enviado',
                            text: 'La cotizacion ha sido enviada, espere la respuesta del dueño.',
                            icon: 'success',
                            timer: '3000',
                            button: false
                        }).then(() => navigate('/'));
                        setObtainedFiles(null);
                    }
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
                        <p>Envia un documento que especifique en detalle lo que se ofrece, lo que debe pagarse y el tiempo de vigencia de la oferta.</p>
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
                                <label htmlFor="quote-file">Seleccione las Imagenes/Archivos</label>
                                <input type="file" id="quote-file" multiple hidden onChange={e => uploadFiles(e.target.files)} />
                            </div>
                        </div>
                        <div className="quote-section">
                            <div className="form-control">
                                <input id="sereal-id" type="text" placeholder="Escriba El SERIAL OT o el id del producto" onChange={e => setId(e.target.value)} />
                            </div>
                            <div className="form-control">
                                <button id="send-quote" onClick={() => handlerQuote()}>Enviar Cotizacion</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    ) : <Navigate to={`/${username}`}/>;
};

export default Quote;