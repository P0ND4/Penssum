import { useState, useRef } from 'react';
import swal from 'sweetalert'
import { changeDate } from '../../helpers/';
import { deleteUser, getProducts, getUsers, removeFiles, socket, sendWarning, userStatusChange } from "../../../api";

function FoundUser({ id, username, userInformation, date, data, setUsers, setProducts }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [userStateSelect, setUserStateSelect] = useState('free');
    const [sendingInformation,setSendingInformation] = useState(false);

    const sendWarningDark = useRef();
    const userState = useRef();

    const sendMessage = (transmitter, receiver) => {
        swal({
            title: 'ESCRIBE EL MENSAJE',
            content: {
                element: "input",
                attributes: {
                    placeholder: "Mensaje a " + username,
                    type: "text",
                },
            },
            button: 'Enviar'
        }).then((value) => {
            if (value === null) return

            if (value) {
                socket.emit('send_message', transmitter, receiver, value);

                swal({
                    title: 'Enviado',
                    text: 'Mensaje enviado con exito',
                    icon: 'success',
                    timer: '2000',
                    button: false,
                });

                socket.emit('received event', receiver);
            };
        });
    };

    const removeUser = async () => {
        swal({
            title: '¿Estas seguro?',
            text: 'El usuario quedara eliminado de la base de datos.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                setSendingInformation(true);
                const userProducts = await getProducts({ username });
                if (userProducts.length > 0) userProducts.forEach(async product => await removeFiles({ files: product.files, activate: true }));
                await deleteUser(id);
                const users = await getUsers();
                setUsers(users);
                document.getElementById(data.property).style.display = 'none';
                const productsObtained = await getProducts();
                setProducts(productsObtained);
                setSendingInformation(false);
            };
        });
    };

    const checkInformation = async () => {
        const errorHandler = document.querySelector('.publish_error_handler');
        errorHandler.classList.remove('showError');
        errorHandler.textContent = '';

        if (title.length >= 3 && title.length <= 20 && description.length >= 50) {
            sendWarningDark.current.style.display = 'none';
            setTitle('');
            setDescription('');

            await sendWarning({ title, description, to: id });

            swal({
                title: '!Exito!',
                text: `Se ha enviado tu la advertencia a ${username} con exito.`,
                icon: 'success',
                timer: 3000,
                button: false,
            });
        } else {
            if (description.length < 50) errorHandler.textContent = 'Describe mas la advertencia.';
            if (title.length < 3) errorHandler.textContent = 'Elije el area a tocar.';
            if (title.length > 20) errorHandler.textContent = 'Escriba un tema corto.';
            errorHandler.classList.add('showError');
        };

        socket.emit('received event', id);
    };

    const completionHandler = async (typeOfUser) => {
        const users = await getUsers();
        setUsers(users);
        userState.current.style.display = 'none';
        swal({
            title: '!Exito!',
            text: `Se ha cambiado el estado de usuario a (${typeOfUser === 'free' ? 'Libre' : typeOfUser === 'layoff' ? 'Suspendido' : 'Bloqueado' }) con exito.`,
            icon: 'success',
            timer: 3000,
            button: false,
        });
        socket.emit('received event', id);
    };

    const sendTypeOfUser = async (typeOfUser) => {
        const handlerError = document.querySelector('.publish_error_handler-state')
        handlerError.textContent = '';
        handlerError.classList.remove('showError');

        if (typeOfUser === 'layoff') {
            const date = document.getElementById('date-time-local').value;
            
            const currentDate = new Date().getTime();
            const currentAdminDate = new Date(date).getTime();

            if (date !== '' && currentAdminDate > currentDate) {
                swal({
                    title: '¿Estas seguro?',
                    text: 'El usuario quedara suspendido por el periodo de tiempo que puso no podra (crear servicios, enviar cotizaciones, ni ofertar).',
                    icon: 'warning',
                    buttons: ['Rechazar', 'Aceptar']
                }).then(async res => {
                    if (res) {
                        await userStatusChange({ id, typeOfUser, date });
                        const users = await getUsers();
                        setUsers(users);
                        userState.current.style.display = 'none';

                        swal({
                            title: '!Exito!',
                            text: `Se ha cambiado el estado de usuario a (${typeOfUser === 'free' ? 'Libre' : typeOfUser === 'layoff' ? 'Suspendido' : 'Bloqueado' }) con exito.`,
                            icon: 'success',
                            timer: 3000,
                            button: false,
                        });
                    };
                });
            } else  {
                if (date === '') handlerError.textContent = 'Ingrese una fecha.';
                if (currentAdminDate <= currentDate) handlerError.textContent = 'Ingrese una fecha mayor a la actual.';
                handlerError.classList.add('showError');
            };

        } else { 
            if (typeOfUser === 'block') {
                swal({
                    title: '¿Estas seguro?',
                    text: 'El usuario no podra usar mas la aplicacion, excepto si cambia la opcion a libre o suspendido.',
                    icon: 'warning',
                    buttons: ['Rechazar', 'Aceptar']
                }).then(res => {
                    if (res) { 
                        swal({
                            title: '¿Eliminar toda la informacion?',
                            text: 'Si le das en aceptar se eliminaran los productos, la foto de perfil y portada, notificaciones, bloqueos, y mensajes, las ofertas propuestas sin revisar se eliminaran automaticamente.',
                            icon: 'info',
                            buttons: ['Rechazar', 'Aceptar']
                        }).then(async res => {
                            if (res) await userStatusChange({ id, typeOfUser, eraseEverything: true })
                            else await userStatusChange({ id, typeOfUser });
                            await completionHandler(typeOfUser);
                        });
                    };
                });
            } else { 
                await userStatusChange({ id, typeOfUser });
                await completionHandler(typeOfUser);
            };
        };
        socket.emit('received event', id);
    };


    return (
        <div className="found-user">
            <i className="fa-solid fa-circle-exclamation icon-exclamation" title="Informacion" onClick={() => document.getElementById(data.property).style.display = 'block'}></i>
            <h4>{userInformation.username}</h4>
            <p className="date-found-user-dashboard">{date}</p>
            <div className="found-options">
                <button title="Envia un mensaje a este usuario" onClick={() => sendMessage('Admin', id)}><i className="fa-solid fa-envelope"></i></button>
                <button title="Cambia el estado del usuario"><i className="fas fa-globe" onClick={() => userState.current.style.display = 'flex'}></i></button>
                <button title="Envia advertencia" onClick={() => sendWarningDark.current.style.display = 'flex'}><i className="fa-solid fa-ban"></i></button>
            </div>
            <div className="dark" id={data.property} style={{ background: '#1b262cdd', overflow: 'auto' }}>
                <div className="dark-information">
                    <div className="user-profile-container" style={{ background: `linear-gradient(45deg, #1B262Cbb,#0F4C7588), url(${data.coverPhoto === null || data.coverPhoto === undefined ? "/img/cover.jpg" : data.coverPhoto})` }}>
                        <div className="user-profile">
                            <img src={(data.profilePicture === null || data.profilePicture === undefined) ? "/img/noProfilePicture.png" : data.profilePicture} className="profile-picture" referrerPolicy="no-referrer" alt="imagen de perfil" />
                            <div className="profile-cover">
                                <div className="profile-description-control">
                                    <h1 className="profile-username">{username}</h1>
                                    <p className="profile-description">{data.description === '' ? 'No definido' : data.description}</p>
                                </div>
                                <div>
                                    <h1 className="profile-score-title">Puntuacion</h1>
                                    <div className="profile-score">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-left exitDarkInformation" onClick={() => document.getElementById(data.property).style.display = 'none'}></i>
                        </div>
                    </div>
                    <div className="information-user-dark" >
                        <div className="information-user">
                            <p>Id unico: {id}</p>
                            <p>Forma de registro: {data.registered}</p>
                            <p>Usuario registrado como: {data.objetive === '' ? 'No completado' : data.objetive}</p>
                            <p>Correo electronico: {data.email}</p>
                            <p>Primer nombre: {data.firstName === '' ? 'No definido' : data.firstName}</p>
                            <p>Segundo nombre: {data.secondName === '' ? 'No definido' : data.secondName}</p>
                            <p>Apellido: {data.lastName === '' ? 'No definido' : data.lastName}</p>
                            <p>Segundo apellido: {data.secondSurname === '' ? 'No definido' : data.secondSurname}</p>
                            <p>C.I: {data.identification === null ? 'No definido' : data.identification}</p>
                            <p>Año de experiencia: {data.yearsOfExperience === null ? 'No definido' : data.yearsOfExperience}</p>
                            <p>Numero de telefono: {data.phoneNumber === null ? 'No definido' : data.phoneNumber}</p>
                            <button 
                                className="delete-user" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                                onClick={() => { if (!sendingInformation) removeUser() }}
                            >Borrar usuario</button>
                        </div>
                        <div className="information-user">
                            <div>
                                <p>Dias disponibles:</p>
                                {data.availability !== undefined
                                    ? <ul className="availability-day-information">
                                        {data.availability.monday ? <li>Lunes</li> : ''}
                                        {data.availability.tuesday ? <li>Martes</li> : ''}
                                        {data.availability.wednesday ? <li>Miercoles</li> : ''}
                                        {data.availability.thursday ? <li>Jueves</li> : ''}
                                        {data.availability.friday ? <li>Viernes</li> : ''}
                                        {data.availability.saturday ? <li>Sabado</li> : ''}
                                        {data.availability.sunday ? <li>Domingo</li> : ''}
                                    </ul> : ''}
                            </div>
                            <p>Disponibilidad de clases vituales: {data.virtualClasses ? 'Si' : 'No'}</p>
                            <p>Disponibilidad de clases presenciales: {data.faceToFaceClasses ? 'Si' : 'No'}</p>
                            <p>Mostrar numero de telefono: {data.showMyNumber ? 'Si' : 'No'}</p>
                            {data.typeOfUser !== undefined ? <p>Tipo de usuario: {data.typeOfUser.user}</p> : <></>}
                            {data.typeOfUser !== undefined ? <p>Tiempo de suspencion: {data.typeOfUser.suspension !== null ? changeDate(data.typeOfUser.suspension) : 'Nulo'}</p> : <></>}
                            <p>Cuenta validada: {data.validated ? 'Si' : 'No'}</p>
                            <p>Fecha de creacion: {date}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dark dark-control" ref={sendWarningDark}>
                <div className="dark-contact-form">
                    <h1>Envia una advertencia</h1>
                    <hr />
                    <p className="dark-contact-p">Si un usuario tiene algo inadecuado puedes enviarle una advertencia para no suspenderlo o bloquearlo y asi advertirle sobre las consecuencias.</p>
                    <p className="field publish_error_handler" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '4px 0' }}></p>
                    <div className="form-control">
                        <input type="text" placeholder="Titulo de la advertencia" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="form-control" style={{ position: 'relative' }}>
                        <textarea className="textarea-dark" value={description} placeholder={`¿Que quieres enviarle a ${username}?`} onChange={e => {
                            setDescription(e.target.value);
                            const errorHandler = document.querySelector('.publish_error_handler');
                            errorHandler.classList.remove('showError');
                        }}></textarea>
                    </div>

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
                        <button className="cancel-edit" onClick={() => {
                            const errorHandler = document.querySelector('.publish_error_handler');
                            errorHandler.classList.remove('showError');
                            errorHandler.textContent = '';
                            sendWarningDark.current.style.display = 'none';

                            setTitle('');
                            setDescription('');
                        }}>Cancelar</button>
                    </div>
                </div>
            </div>
            <div className="dark dark-control" ref={userState}>
                <div className="dark-contact-form">
                    <h1>Elije el estado del usuario</h1>
                    <hr />
                    <p className="dark-contact-p">{
                        userStateSelect === 'free'
                            ? 'El usuario comun sin restrinciones.'
                            : userStateSelect === 'layoff'
                                ? 'El usuario se supendera durante un tiempo, no podra hacer ofertas, publicar servicio, solo podra ver productos, cambiar su informacion de perfil etc.'
                                : userStateSelect === 'block'
                                    ? 'No tendra acceso a la aplicacion, no podra cambiar su informacion personal, no podra ver ningun servicio, tiene restringido el uso de PENSSUM'
                                    : 'Select desconocido'
                    }</p>
                    <p className="field publish_error_handler-state" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '4px 0' }}></p>
                    <div className="form-control">
                        <select id="filter-state-change" defaultValue={data.typeOfUser !== undefined && data.typeOfUser.user} onChange={e => {
                            setUserStateSelect(e.target.value)
                            document.querySelector('.publish_error_handler-state').classList.remove('showError');
                        }}>
                            <option value="free">Libre</option>
                            <option value="layoff">Suspender</option>
                            <option value="block">Bloquear</option>
                        </select>
                    </div>
                    {userStateSelect === 'layoff' && (
                        <div className="form-control">
                            <input type="datetime-local" id="date-time-local"/>
                        </div>
                    )}
                    <div className="dark-button-container">
                        <button className="save-edit" onClick={() => sendTypeOfUser(userStateSelect)}>Enviar</button>
                        <button className="cancel-edit" onClick={() => {
                            userState.current.style.display = 'none';
                            document.querySelector('.publish_error_handler-state').textContent = '';
                            document.querySelector('.publish_error_handler-state').classList.remove('showError');
                            if (document.getElementById('date-time-local')) document.getElementById('date-time-local').value = '';
                            document.getElementById('filter-state-change').value = data.typeOfUser.user;
                            setUserStateSelect('free');
                        }}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoundUser;