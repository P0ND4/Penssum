import swal from 'sweetalert'
import { deleteUser, getProducts, getUsers, removeFiles } from "../../../api";

function FounUser({ id, username, date, data, setUsers }) {
    const removeUser = async () => {
        swal({
            title: '¿Estas seguro?',
            text: 'El usuario quedara eliminado de la base de datos.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                const userProducts = await getProducts({ username });
                if (userProducts.length > 0) userProducts.forEach(async product => await removeFiles({ files: product.files, activate: true }));
                await deleteUser(id);
                const users = await getUsers();
                setUsers(users);
                document.getElementById(data.property).style.display = 'none';
            };
        });
    };

    return (
        <div className="found-user">
            <i className="fa-solid fa-circle-exclamation icon-exclamation" title="Informacion" onClick={() => document.getElementById(data.property).style.display = 'block'}></i>
            <h4>{username}</h4>
            <p>{date}</p>
            <div className="found-options">
                <button title="Envia un mensaje a este usuario"><i className="fa-solid fa-envelope"></i></button>
                <button title="Cambia el estado del usuario"><i className="fas fa-globe"></i></button>
                <button title="Envia advertencia"><i className="fa-solid fa-ban"></i></button>
            </div>
            <div className="dark" id={data.property} style={{ background: '#1b262cdd' }}>
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
                            <button className="delete-user" onClick={() => removeUser()}>Borrar usuario</button>
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
                            {data.userType !== undefined ? <p>Tipo de usuario: {data.typeOfUser.user}</p> : <></>}
                            <p>Cuenta validada: {data.validated ? 'Si' : 'No'}</p>
                            <p>Fecha de creacion: {date}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default FounUser;