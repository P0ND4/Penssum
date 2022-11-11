import { useRef } from 'react';
import { removeFiles, sendInformationAdmin } from '../../../api';
import { fileEvent } from '../../helpers/';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function ContactForm(data) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sendingInformation,setSendingInformation] = useState(false);

    const navigate = useNavigate();

    const errorHandler = useRef();

    const uploadFiles = async (files) => {
        errorHandler.current.classList.remove('showError');
        errorHandler.current.textContent = '';

        const result = await fileEvent.uploadFiles(files, 6, data.obtainedFiles, data.setObtainedFiles);
    
        if (result.error) {
            if (result.type === 'Exceeds the number of files allowed') {
                errorHandler.current.textContent = 'Solo se acepta un máximo de 6 archivos.';
                errorHandler.current.classList.add('showError');
            } else if (result.type === 'some files were not uploaded becuase they break file rules') {
                errorHandler.current.innerHTML = `Algunos archivos no fueron subidos.`;
                errorHandler.current.classList.add('showError');
            }
        }
    };

    const checkInformation = async () => {
        errorHandler.current.classList.remove('showError');
        errorHandler.current.textContent = '';

        if (title.length >= 3 && title.length <= 20 && description.length >= 50 && description.length <= 2000) {
            setSendingInformation(true);
            await sendInformationAdmin({
                from: cookies.get('id'),
                color: data.id === 'dark-help-information' ? 'yellow' : data.id === 'dark-report-error' ? 'orange' : 'yellow',
                mainTitle: data.id === 'dark-help-information' ? 'Un usuario te ha pedido ayuda' : data.id === 'dark-report-error' ? 'Un usuario reporto un error' : '',
                title,
                words: data.id === 'dark-help-information' ? 'Has recibido un mensaje de ayuda sobre' : data.id === 'dark-report-error' ? 'Han reportado un error en la página sobre' : '',
                description: description,
                files: data.obtainedFiles
            });
            setSendingInformation(false);
            data.setObtainedFiles(null);
            swal({
                title: '!Éxito!',
                text: `Se ha enviado tú ${data.id === 'dark-help-information' ? 'Petición de ayuda, se va a atender tu petición en las próximas 24 horas, muchas gracias por usar PENSSUM' : data.id === 'dark-report-error' ? 'Reporte de error, muchas gracias por apoyarnos y ayudarnos a mejorar a PENSSUM' : ''}.`,
                icon: 'success',
                timer: 3000,
                button: false,
            }).then(() => navigate('/'));
        } else {
            if (description.length < 50) errorHandler.current.textContent = 'Describe más el área a mejorar.';
            if (description.length > 2000) errorHandler.current.textContent = 'No debe contener más de 2.000 caracteres.';
            if (title.length < 3) errorHandler.current.textContent = 'Elige el área a tocar.';
            if (title.length > 20) errorHandler.current.textContent = 'Escriba un tema corto.';
            errorHandler.current.classList.add('showError');
        };
    };

    const cancel = async () => {
        errorHandler.current.classList.remove('showError');
        errorHandler.current.textContent = '';
        document.getElementById(data.id).style.display = 'none';
        data.setIsOpen(false);
        document.getElementById(data.idTextarea).value = '';
        document.getElementById(data.idInput).value = '';
        document.querySelector(`.count-${data.id}`).textContent = `0/2000`;

        setTitle('');
        setDescription('');

        if (data.obtainedFiles !== null && data.obtainedFiles !== undefined && data.obtainedFiles.length > 0) {
            await removeFiles({ files: data.obtainedFiles });
            data.setObtainedFiles(null);
        };
    };

    return (
        <div className="dark dark-control" id={data.id}>
            <div className="dark-contact-form">
                <h1>{data.title}</h1>
                <hr />
                <p className="dark-contact-p">{data.description}</p>
                <p className="field publish_error_handler" ref={errorHandler} style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '4px 0' }}></p>
                <div className="form-control">
                    <input placeholder={data.placeholder} value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="form-control"  style={{ position: 'relative' }}>
                    <textarea className="textarea-dark" value={description}  placeholder={data.textareaPlaceholder} id={data.idTextarea} maxLength="2000" onChange={e => {
                        setDescription(e.target.value);
                        document.querySelector(`.count-${data.id}`).textContent = `${e.target.value.length}/2000`;
                        const errorHandler = document.querySelector('.publish_error_handler');
                        errorHandler.classList.remove('showError');
                    }}></textarea>
                    <span id="letter-count-help-description" className={`count-${data.id}`}>0/2000</span>
                </div>
                <div className="search-file-in-contact-zone-container">
                    <label htmlFor={data.idInput}>Buscar imagenes/archivos ({data.dataValue})</label>
                    <input type="file" id={data.idInput} hidden multiple onChange={e => uploadFiles(e.target.files)} />
                </div>
                <p className="dark-files-count">Archivos subidos: <span>{data.obtainedFiles !== null && data.obtainedFiles !== undefined ?  data.obtainedFiles.length : 0 }</span></p>
                <div className="dark-button-container">
                    <button 
                        className="save-edit"
                        style={{ 
                            background: sendingInformation ? '#3282B8' : '', 
                            opacity: sendingInformation ? '.4' : '', 
                            cursor: sendingInformation ? 'not-allowed' : '' 
                        }}
                        onClick={() => { if (!sendingInformation) checkInformation() }}
                    >Enviar</button>
                    <button className="cancel-edit" onClick={() => cancel()}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;