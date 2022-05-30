import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import Cookies from 'universal-cookie';
import { getNotifications, markNotification, getUncheckedMessages, markUncheckedMessages, socket } from "../../api";
import PlainNotification from "../parts/PlainNotification";

const cookies = new Cookies();

function Nav({ auth, userInformation, setUserInformation, setAuth, search, setSearch, setFilterNav, filterNav, notifications, setNotifications, countInNotification, setCountInNotification, countInMessages, setCountInMessages }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenSearch, setIsOpenSearch] = useState(false);
    const [isOpenNoLogin, setIsOpenNotLogin] = useState(false);
    const [isOpenPlainNotification, setIsOpenPlainNotification] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);
    

    const navigate = useNavigate();

    let menuRef = useRef();
    let menuNoLogin = useRef();
    let plainNotificationMenu = useRef();

    const changeWidth = () => setWidth(window.innerWidth);

    useEffect(() => {
        const obtainCountInformation = async () => {
            const briefNotifications = await getNotifications(cookies.get('id'));
            const briefMessages = await getUncheckedMessages(cookies.get('id'));

            setCountInMessages(briefMessages.length);

            const currentNotification = [];
            let count = 0;

            for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
            for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

            setCountInNotification(count);
            setNotifications(currentNotification);
        };
        obtainCountInformation();
    }, [userInformation,setCountInMessages,setCountInNotification,setNotifications]);

    useEffect(() => document.getElementById('search').value = search, [search]);

    useEffect(() => {
        window.addEventListener('resize', changeWidth);
        return (() => window.removeEventListener('resize', changeWidth));
    });

    useEffect(() => {
        const body = document.querySelector('body');

        if (!auth) {
            if (isOpenNoLogin) { document.querySelector('.nav-sidebar-no-login').classList.add('nav-sidebar-no-login-active') }
            else { document.querySelector('.nav-sidebar-no-login').classList.remove('nav-sidebar-no-login-active') };

            (isOpenNoLogin) ? body.style.overflow = 'hidden' : body.style.overflow = 'auto';

            const handler = e => {
                if (menuNoLogin.current) {
                    if (!menuNoLogin.current.contains(e.target)) {
                        setIsOpenNotLogin(false);
                    };
                }
            };

            document.addEventListener('mousedown', handler);

            return (() => document.removeEventListener('mousedown', handler));
        } else {
            (isOpen && width < 600) ? body.style.overflow = 'hidden' : body.style.overflow = 'auto';

            const handler = (element, e) => {
                if (element.current) {
                    if (!element.current.contains(e.target)) {
                        element === menuRef
                            ? setIsOpen(false)
                            : setIsOpenPlainNotification(false);
                    };
                }
            };

            document.addEventListener('mousedown', e => handler(menuRef, e));
            document.addEventListener('mousedown', e => handler(plainNotificationMenu, e));

            return (() => {
                document.removeEventListener('mousedown', e => handler(menuRef, e));
                document.removeEventListener('mousedown', e => handler(plainNotificationMenu, e));
            });
        };
    });

    const logOut = () => {
        socket.emit('logout', cookies.get('id'));
        cookies.remove('id');
        setAuth(false);
        setIsOpen(false);
        setUserInformation({});
        navigate('/');
    };

    const changeSearch = e => {
        setSearch(e.target.value);
        (e.target.value === '') ? navigate('/') : navigate(`/search/${e.target.value}`)
    };

    return (
        <nav className="nav-container">
            <Link to="/" className="main-logo"><img src="/img/penssum-transparent.png" alt="icon-logo"/> Penssum</Link>
            <div className="search-provider" style={{ display: (isOpenSearch && width < 600) ? 'flex' : (width > 600) ? 'flex' : 'none' }}>
                <input type="text" placeholder="Encuentra Profesores O Estudiantes" id="search" value={search} autoComplete="off" onChange={e => changeSearch(e)} />
                <select id="filter-city" defaultValue="ciudad" onChange={e => setFilterNav({ ...filterNav, city: e.target.value })}>
                    <option value="ciudad">Ciudad</option>
                    <option value="Bogota">Bogota</option>
                    <option value="Valle del cauca">Valle del cauca</option>
                    <option value="Antioquia">Antioquia</option>
                    <option value="Satander">Santander</option>
                    <option value="Amazonas">Amazonas</option>
                    <option value="Aracua">Aracua</option>
                    <option value="Atlantico">Atlantico</option>
                    <option value="Bolivar">Bolivar</option>
                    <option value="Boyaca">Boyaca</option>
                    <option value="Caldas">Caldas</option>
                    <option value="Caqueta">Caqueta</option>
                    <option value="Casanare">Casanare</option>
                    <option value="Cauca">Cauca</option>
                    <option value="Cesar">Cesar</option>
                    <option value="Choco">Choco</option>
                    <option value="Cordoba">Cordoba</option>
                    <option value="Cundinamarca">Cundinamarca</option>
                    <option value="Guainia">Guainia</option>
                    <option value="Guaviare">Guaviare</option>
                    <option value="Huila">Huila</option>
                    <option value="La guajira">La guajira</option>
                    <option value="Magdalena">Magdalena</option>
                    <option value="Meta">Meta</option>
                    <option value="Nariño">Nariño</option>
                    <option value="Norte de santander">Norte de santander</option>
                    <option value="Putumayo">Putumayo</option>
                    <option value="Quindio">Quindio</option>
                    <option value="Risaralda">Risaralda</option>
                    <option value="San andres">San andres</option>
                    <option value="Sucre">Sucre</option>
                    <option value="Tolima">Tolima</option>
                    <option value="Vaupes">Vaupes</option>
                    <option value="Vichada">Vichada</option>
                </select>
                <select id="filter-user" defaultValue="usuario" onChange={e => setFilterNav({ ...filterNav, user: e.target.value })}>
                    <option value="usuario">Usuario</option>
                    <option value="Profesor">Profesor</option>
                    <option value="Alumno">Alumno</option>
                </select>
            </div>
            <div className="nav-button-container">
                {auth && userInformation.typeOfUser.user !== 'block' ?
                    <div ref={plainNotificationMenu}>
                        <div className="user-span-container" onClick={() => {
                            if (countInNotification > 0) markNotification(cookies.get('id'));
                            setCountInNotification(0);
                            setIsOpenPlainNotification(!isOpenPlainNotification)
                        }}>
                            <i className="fas fa-bell" id="bell"></i>
                            {countInNotification > 0 ? <span className="user-count">{countInNotification > 3 ? '+3' : countInNotification}</span> : ''}
                        </div>
                        <div className="plain-notification-container" style={{ display: isOpenPlainNotification ? 'block' : 'none' }}>
                            {notifications !== null && notifications.length > 0
                                ? notifications.map(notification => {
                                    return (
                                        <div key={notification._id}>
                                            <Link to="/notifications" style={{ textDecoration: 'none' }} onClick={() => setIsOpenPlainNotification(false)}>
                                                <PlainNotification
                                                    title={notification.title}
                                                    description={notification.description}
                                                    color={notification.color}
                                                    image={notification.image}
                                                />
                                            </Link>
                                        </div>
                                    );
                                }) : <p className="thereAreNoPlainNotification">No hay notificaciones</p>}
                            {notifications !== null && notifications.length > 0 ? <Link to="/notifications" className="notification-view" onClick={() => setIsOpenPlainNotification(false)}>Ver todas las notificaciones</Link> : ''}
                        </div>
                    </div> : <></>}
                {auth && userInformation.typeOfUser.user !== 'block' ? (
                    <Link to="/messages" className="user-span-container" style={{ textDecoration: 'none' }} onClick={() => {
                        setCountInMessages(0);
                        if (countInMessages > 0) markUncheckedMessages(cookies.get('id'));
                    }}>
                        <i className="fas fa-envelope" id="user-messages"></i>
                        {countInMessages > 0 ? <span className="user-count">{countInMessages > 3 ? '+3' : countInMessages}</span> : ''}
                    </Link>
                ) : <></>}
                <i className="fas fa-search" id="icon-search" onClick={() => setIsOpenSearch(!isOpenSearch)}></i>
                {!auth ?
                    <div>
                        <div className="nav-button">
                            <Link to="/signup"><button id="signup">Registrate</button></Link>
                            <Link to="/signin"><button id="signin">Ingresar</button></Link>
                            <i id="bars" className="fas fa-bars" onClick={() => setIsOpenNotLogin(true)}></i>
                        </div>
                        <div ref={menuNoLogin} className="nav-sidebar-no-login" style={{ display: (width < 600) ? 'block' : 'none' }}>
                            <div className="nav-title-container-no-login">
                                <i className="fas fa-chevron-left" onClick={() => setIsOpenNotLogin(false)}></i>
                                <h1 className="nav-sidebar-name">{(userInformation.firstName === '') ? userInformation.username : userInformation.firstName}</h1>
                            </div>
                            <div className="nav-user-not-register">
                                <Link to="/signin" className="nav-sidebar-link-divider" onClick={() => setIsOpenNotLogin(false)}><i className="fa-solid fa-arrow-right-to-bracket" ></i><h2 className="nav-sidebar-link">Iniciar Session</h2></Link>
                                <hr />
                                <Link className="nav-sidebar-link-divider" to="/signup" onClick={() => setIsOpenNotLogin(false)}><i className="fa-solid fa-user" ></i><h2 className="nav-sidebar-link">Registrarte</h2></Link>
                                <hr />
                                <Link className="nav-sidebar-link-divider" to="/help" onClick={() => setIsOpenNotLogin(false)}><i className="fa-solid fa-circle-question"></i><h2 className="nav-sidebar-link">Ayuda y contacto</h2></Link>
                            </div>
                        </div>
                    </div>
                    :
                    <div ref={menuRef}>
                        <div className="auth-successfuly">
                            <button id="account" style={{ background: isOpen ? '#2c373d' : 'transparent' }} onClick={() => setIsOpen(!isOpen)}>
                                <img src={(userInformation.profilePicture === null) ? "/img/noProfilePicture.png" : userInformation.profilePicture} className="nav-profile-image" referrerPolicy="no-referrer" alt="imagen de perfil" />
                                <p className="nav-profile-name">{(userInformation.firstName === '') ? userInformation.username : userInformation.firstName}</p>
                            </button>
                        </div>
                        <div className="nav-sidebar-container" style={{ display: isOpen ? 'flex' : 'none' }}>
                            <div className="nav-sidebar">
                                <div className="nav-title-container">
                                    <i className="fas fa-chevron-left" id="fa-chevron-left" onClick={() => setIsOpen(false)}></i>
                                    <h1 className="nav-sidebar-name">{(userInformation.firstName === '') ? userInformation.username : userInformation.firstName}</h1>
                                </div>
                                <div className="main-nav-sidebar-link">
                                    {userInformation.typeOfUser.user !== 'block' && (
                                        <div>
                                            <Link to="/improvement/comment" className="nav-sidebar-link-divider" onClick={() => setIsOpen(false)}>
                                                <i className="far fa-comments"></i>
                                                <div className="nav-sidebar-link-comment-container">
                                                    <h2 className="nav-sidebar-link-comment">Enviar Comentarios</h2>
                                                    <p>Ayudanos a mejorar la nueva version de Penssum</p>
                                                </div>
                                            </Link>
                                            <hr />
                                            <div>
                                                <Link to={`/${userInformation.username}`} className="nav-sidebar-link-divider" onClick={() => setIsOpen(false)}>
                                                    <i className="far fa-user-circle"></i>
                                                    <h2 className="nav-sidebar-link">Perfil</h2>
                                                </Link>
                                                <Link className="nav-sidebar-link-divider" to="/messages" onClick={() => setIsOpen(false)}>
                                                    <i className="fas fa-envelope"></i>
                                                    <h2 className="nav-sidebar-link">Mensajes</h2>
                                                </Link>
                                                <Link className="nav-sidebar-link-divider" to="/preference/mod=general" onClick={() => setIsOpen(false)}>
                                                    <i className="fas fa-cog"></i>
                                                    <h2 className="nav-sidebar-link">Preferencias</h2>
                                                </Link>
                                                <Link className="nav-sidebar-link-divider" to="/report" onClick={() => setIsOpen(false)}>
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    <h2 className="nav-sidebar-link">Reportar</h2>
                                                </Link>
                                                <Link className="nav-sidebar-link-divider" to="/help" onClick={() => setIsOpen(false)}>
                                                    <i className="far fa-question-circle"></i>
                                                    <h2 className="nav-sidebar-link">Ayuda y soporte</h2>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    <hr />
                                    <button className="nav-sidebar-link-divider logout" id="logout" onClick={() => logOut()}>
                                        <i className="fas fa-door-open"></i>
                                        <h2 className="nav-sidebar-link">Cerrar Sesion</h2>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>}
            </div>
        </nav>
    );
};

export default Nav;