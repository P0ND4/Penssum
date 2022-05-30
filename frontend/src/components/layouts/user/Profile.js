import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { 
    getUser, 
    getProducts, 
    changePhoto, 
    blockUser, 
    socket, 
    reviewBlocked, 
    removeBlock, 
    filterProducts, 
    getNotifications,
    getTransaction,
    getVote
} from '../../../api';
import { changeDate } from '../../helpers';
import getCroppedImg from '../../parts/user/cropImage';
import Cropper from 'react-easy-crop'
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

import Product from '../../parts/Product';
import Loading from '../../parts/Loading';

const cookies = new Cookies();

function Profile({ mainUsername, userInformation, setUserInformation, auth, setProducts, setReportUsername, setNotifications, setCountInNotification, isTheUserSuspended, deadline }) {
    const [imgSrc, setImgSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [cropSize, setCropSize] = useState({ width: 200, height: 200 });
    const [photoType, setPhotoType] = useState('');
    const [foundUserInformation, setFoundUserInformation] = useState(null);
    const [userProducts, setUserProducts] = useState(null);
    const [isBlocked, setIsBlocked] = useState({ blocked: null, userView: null });
    const [userTransaction,setUserTransaction] = useState({
        transaction: false,
        amount: 0
    });
    const [informationIsActivated, setInformationIsActivated] = useState(false);
    const [filter, setFilter] = useState({
        mainCategory: 'category',
        mainSubcategory: 'subcategory'
    });
    const [score,setScore] = useState({ votes: 0, count: 0 });

    const { username } = useParams();
    const navigate = useNavigate();

    const searchPhoto = useRef();
    const newsSpan = useRef();
    const userProfile = useRef();
    const userInformationDetails = useRef();
    const changePhotoToCover = useRef();

    useEffect(() => {
        const checkVote = async () => {
            if (foundUserInformation !== null) {
                const result = await getVote({ 
                    to: foundUserInformation._id,
                    voteType: 'user'
                });

                setScore(result);
            };
        };
        checkVote();
    },[foundUserInformation]);

    useEffect(() => {
        const getUserParams = async () => {
            const user = await getUser({ username });
            const userProducts = await getProducts({ username });
            const userTransaction = await getTransaction({ userID: cookies.get('id') });
            if (user.error) return navigate('/');
            if (!userTransaction.error) {
                setUserTransaction({
                    transaction: true,
                    amount: userTransaction.amount
                });
            };
            setFoundUserInformation(user);
            setUserProducts(userProducts);
        };
        getUserParams()
    }, [navigate, username]);

    useEffect(() => {
        const watchLock = async () => {
            const id = cookies.get('id');

            if (id !== undefined && foundUserInformation !== null) {
                const result = await reviewBlocked({ from: id, to: foundUserInformation._id });

                if (result.length > 0) {
                    setIsBlocked({ blocked: true, userView: (result[0].from === cookies.get('id') ? 'from' : 'to') });
                    if (result[0].from === cookies.get('id')) {
                        swal({
                            title: '¿Quieres quitar el bloqueo?',
                            text: 'Si quitas el bloqueo podras ver las publicaciones de este usuario, aparte que tambien podra enviarte mensajes entre otras funcionalidades.',
                            icon: 'warning',
                            buttons: ['Rechazar', 'Aceptar']
                        }).then(async res => {
                            if (res) {
                                await removeBlock({ from: id, to: foundUserInformation._id });
                                socket.emit('received event', foundUserInformation._id);
                                setIsBlocked({ blocked: false, userView: null });

                                const products = await getProducts({ blockSearch: id });
                                setProducts(products);
                                const briefNotifications = await getNotifications(cookies.get('id'));

                                const currentNotification = [];
                                let count = 0;

                                for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
                                for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

                                setCountInNotification(count);
                                setNotifications(currentNotification);
                            };
                        });
                    };
                } else setIsBlocked({ blocked: false, userView: null });
            }
        };
        watchLock();
    }, [foundUserInformation, setProducts, setCountInNotification, setNotifications]);

    const nameEvent = () => {
        if (foundUserInformation.firstName === '' && foundUserInformation.secondName === '' && foundUserInformation.lastName === '' && foundUserInformation.secondSurname === '') {
            return foundUserInformation.username;
        } else {
            if (foundUserInformation.firstName !== undefined && foundUserInformation.secondName !== undefined && foundUserInformation.lastName !== undefined && foundUserInformation.secondSurname !== undefined) {
                return `
                    ${foundUserInformation.firstName !== '' ? foundUserInformation.firstName : ''} 
                    ${foundUserInformation.secondtName !== '' ? foundUserInformation.secondName : ''}
                    ${foundUserInformation.lastName !== '' ? foundUserInformation.lastName : ''} 
                    ${foundUserInformation.secondSurname !== '' ? foundUserInformation.secondSurname : ''}  
                `;
            } else {
                return <Loading margin="auto" />;
            };
        };
    };

    const getNotificationsInProfile = async () => {
        const briefNotifications = await getNotifications(cookies.get('id'));

        const currentNotification = [];
        let count = 0;

        for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
        for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

        setCountInNotification(count);
        setNotifications(currentNotification);
    };

    const block = async (from, to) => {
        swal({
            title: '¿Estas seguro?',
            text: 'Si bloqueas al usuario no podra enviarte mensajes o ver tus publicaciones, todas las notificaciones de este usuario, o cotizaciones quedaran eliminadas. Solo tu lo puedes desbloquear entrando de nuevo a su perfil y presionando el boton de desbloqueo.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                const result = await blockUser({ from, to });

                socket.emit('received event', to);

                if (!result.error) {
                    const products = await getProducts({ blockSearch: cookies.get('id') });
                    setProducts(products);

                    await getNotificationsInProfile();

                    swal({
                        title: 'Usuario Bloqueado',
                        text: 'El usuario ha sido bloqueado con exito.',
                        icon: 'success',
                        timer: '2000',
                        button: false,
                    }).then(() => navigate('/'));
                } else {
                    swal({
                        title: 'Error',
                        text: 'Hubo un error al bloquear el usuario.',
                        icon: 'error',
                        timer: '2000',
                        button: false,
                    });
                };
            };
        });
    };

    const sendMessage = (transmitter, receiver) => {
        swal({
            title: 'ESCRIBE EL MENSAJE',
            content: {
                element: "input",
                attributes: {
                    placeholder: "Mensaje",
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
                    button: false
                });

                socket.emit('received event', receiver);
            };
        });
    };

    const saveCroppedImage = useCallback(async () => {
        newsSpan.current.textContent = '!Guardado con exito!';

        try {
            const { file } = await getCroppedImg(imgSrc, croppedAreaPixels);
            closeCropArea();
            const formData = new FormData();
            formData.append('image', file, file.name);
            formData.set('oldPhoto', photoType === 'profile' ? foundUserInformation.profilePicture : photoType === 'cover' ? foundUserInformation.coverPhoto : '');
            formData.set('photoType', photoType);
            formData.set('id', cookies.get('id'));

            const result = await changePhoto(formData);

            if (result.error) {
                newsSpan.current.textContent = 'Hubo un error';
                newsSpan.current.classList.add('news-span-active');
                setTimeout(() => newsSpan.current.classList.remove('news-span-active'), 4000);
            } else {
                if (photoType === 'profile') {
                    setUserInformation({
                        ...userInformation,
                        profilePicture: result.url
                    });
                    setFoundUserInformation({
                        ...foundUserInformation,
                        profilePicture: result.url
                    });
                } else if (photoType === 'cover') {
                    setFoundUserInformation({
                        ...foundUserInformation,
                        coverPhoto: result.url
                    });
                    setUserInformation({
                        ...userInformation,
                        coverPhoto: result.url
                    });
                }
                newsSpan.current.classList.add('news-span-active');
                setTimeout(() => newsSpan.current.classList.remove('news-span-active'), 4000);
            };
        } catch (e) { console.error(e) }
    }, [croppedAreaPixels, imgSrc, foundUserInformation, userInformation, setUserInformation, photoType]);

    const uploadedImage = (image, photoType) => {
        (photoType === 'cover')
            ? setCropSize({ width: 350, height: 100 })
            : setCropSize({ width: 200, height: 200 });
        window.scrollTo(0, 0);
        document.querySelector('body').style.overflow = 'hidden';
        setImgSrc(URL.createObjectURL(image));
    };

    const closeCropArea = () => {
        setImgSrc(null)
        searchPhoto.current.value = '';
        document.querySelector('body').style.overflow = 'auto';
    };

    const searchByFilter = async e => {
        document.getElementById("subcategory-secondary").value = '';

        setFilter({
            ...filter,
            [e.target.name]: e.target.value
        });

        const products = await filterProducts({
            idUser: foundUserInformation._id,
            category: (e.target.name === 'mainCategory') ? e.target.value : filter.mainCategory,
            subCategory: (e.target.name === 'mainSubcategory') ? e.target.value : filter.mainSubcategory
        });
        setUserProducts(products);
    };

    return userProducts !== null && (isBlocked.blocked !== null || !auth) && foundUserInformation !== null ? 
        foundUserInformation.typeOfUser.user !== 'block' ? (
            <div className="profile-container">
                <header className="user-profile-container" style={{ background: `linear-gradient(45deg, #1B262Cbb,#0F4C7588), url(${foundUserInformation.coverPhoto === null || foundUserInformation.coverPhoto === undefined ? "/img/cover.jpg" : foundUserInformation.coverPhoto})` }}>
                    <div className="user-profile" ref={userProfile}>
                        <div className="user-profile-option-container">
                            <div className="union-user-profile-picture">
                                {mainUsername === username ? <label htmlFor="change-profile-picture" className="edit-user-profile-picture" title="Edita la foto de perfil" onClick={() => setPhotoType('profile')}><i className="fa fa-pencil"></i></label> : ''}
                                <img src={(foundUserInformation.profilePicture === null || foundUserInformation.profilePicture === undefined) ? "/img/noProfilePicture.png" : foundUserInformation.profilePicture} className="profile-picture" referrerPolicy="no-referrer" alt="imagen de perfil" />
                            </div>
                            {mainUsername !== username && auth && !isBlocked.blocked && (
                                <div className="user-option-icon">
                                    <i className="fas fa-ban" title="Bloquear" onClick={() => block(cookies.get('id'), foundUserInformation._id)}></i>
                                    <i className="fas fa-paper-plane" title="Enviar mensaje" onClick={() => sendMessage(cookies.get('id'), foundUserInformation._id)}></i>
                                    <i className="fas fa-exclamation-triangle" title="Reportar usuario" onClick={() => {
                                        setReportUsername(username);
                                        navigate('/report');
                                    }}></i>
                                </div>
                            )}
                        </div>

                        <div className="profile-cover">
                            {isBlocked.blocked && (
                                <div className="profile-blocked">
                                    <i className="fas fa-ban"></i>
                                    <p>
                                        {
                                            isBlocked.userView === 'from'
                                                ? 'Has bloqueado a este usuario'
                                                : 'Este usuario te ha bloqueado'
                                        }
                                    </p>
                                </div>
                            )}
                            {isBlocked.blocked && isBlocked.userView === 'from' && (
                                <button className="unlock-user" onClick={async () => {
                                    await removeBlock({ from: cookies.get('id'), to: foundUserInformation._id });
                                    setIsBlocked({ blocked: false, userView: null });

                                    const products = await getProducts({ blockSearch: cookies.get('id') });
                                    setProducts(products);
                                    await getNotificationsInProfile();
                                }}><i className="fas fa-ban"></i> Desbloquear</button>
                            )}
                            {!isBlocked.blocked &&
                                (
                                    <div className="profile-description-control">
                                        <h1 className="profile-username">{nameEvent()}</h1>
                                        <p className="profile-description">{foundUserInformation.description}</p>
                                        {(mainUsername === username && userTransaction.transaction) && <p className="profile-money-pit">Dinero retenido: <span>{userTransaction.amount}$</span></p>}
                                    </div>
                                )}
                            {!isBlocked.blocked &&
                                (
                                    <div>
                                        <h1 className="profile-score-title">Puntuacion: {score.votes === 0 ? '' : score.votes % 1 === 0 ? score.votes : score.votes.toFixed(1)}</h1>
                                        <div className="profile-score">
                                            <i className="fas fa-star" style={{ color: Math.round(score.votes) === 5 ? '#fbff00' : '' }}></i>
                                            <i className="fas fa-star" style={{ color: Math.round(score.votes) === 4 || Math.round(score.votes) === 5 ? '#fbff00' : '' }}></i>
                                            <i className="fas fa-star" style={{ color: Math.round(score.votes) === 3 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 ? '#fbff00' : ''  }}></i>
                                            <i className="fas fa-star" style={{ color: Math.round(score.votes) === 2 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 || Math.round(score.votes) === 3 ? '#fbff00' : ''  }}></i>
                                            <i className="fas fa-star" style={{ color: Math.round(score.votes) === 1 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 || Math.round(score.votes) === 3 || Math.round(score.votes) === 2 ? '#fbff00' : ''  }}></i>
                                        </div>
                                        {score.count !== 0 && <p className="total-votes">Votos totales: {score.count}</p>}
                                    </div>
                                )}
                        </div>

                    </div>
                    <div className="user-information" ref={userInformationDetails}>
                        <section>
                            <p>Tipo de usuario: {foundUserInformation.objetive}</p>
                            <p>Ciudad: {foundUserInformation.city === null || foundUserInformation.city === '' ? 'Indefinido' : foundUserInformation.city}</p>
                            <p>Años de experiencia: {foundUserInformation.yearsOfExperience === null || foundUserInformation.yearsOfExperience === '' ? 'Indefinido' : foundUserInformation.yearsOfExperience}</p>
                            <p>Disponibilidad de clases virtuales: {foundUserInformation.virtualClasses === false ? 'No' : 'Si'}</p>
                            <p>Disponibilidad de clases presenciales: {foundUserInformation.faceToFaceClasses === false ? 'No' : 'Si'}</p>
                        </section>
                    </div>
                    {!isBlocked.blocked && (
                        <i className="fa-solid fa-circle-exclamation view-user-information" title="Ver mas informacion" onClick={() => {
                            if (!informationIsActivated) {
                                userProfile.current.style.transform = 'scaleY(0)'
                                userInformationDetails.current.style.transform = 'scaleY(1)';
                                if (mainUsername === username) changePhotoToCover.current.style.transform = 'scaleY(0)';
                            } else {
                                userProfile.current.style.transform = 'scaleY(1)';
                                userInformationDetails.current.style.transform = 'scaleY(0)';
                                if (mainUsername === username) changePhotoToCover.current.style.transform = 'scaleY(1)';
                            };

                            setInformationIsActivated(!informationIsActivated);
                        }}></i>
                    )}
                    {mainUsername === username ? <label htmlFor="change-profile-picture" className="edit-user-cover-photo" title="Edita la foto de portada" ref={changePhotoToCover} onClick={() => setPhotoType('cover')}><i className="fa fa-pencil"></i> <p>Editar foto de portada</p></label> : ''}
                    {mainUsername === username ? <input ref={searchPhoto} type="file" accept="image/*" id="change-profile-picture" hidden onChange={e => uploadedImage(e.target.files[0], photoType)} /> : ''}
                </header>
                {isTheUserSuspended && deadline !== null && (
                    <section className="userSuspendedContainer">
                        <p className="suspended-title">Tiempo de suspencion</p>
                        <div className="profile-date-timer">
                            <div className="profile-timer-data">
                                <p className="timer-data-title">Dias</p>
                                <p className="profile-count-timer-data">{deadline.remainDays}</p>
                            </div>
                            <div className="profile-timer-data">
                                <p className="timer-data-title">Horas</p>
                                <p className="profile-count-timer-data">{deadline.remainHours}</p>
                            </div>
                            <div className="profile-timer-data">
                                <p className="timer-data-title">Minutos</p>
                                <p className="profile-count-timer-data">{deadline.remainMinutes}</p>
                            </div>
                            <div className="profile-timer-data">
                                <p className="timer-data-title">Segundos</p>
                                <p className="profile-count-timer-data">{deadline.remainSeconds}</p>
                            </div>
                        </div>
                    </section>
                )}
                {!isBlocked.blocked
                    ? (
                        <div className="profile-business-hours-for-mobile">
                            <h1 className="business-hours-title">Horario De Atencion</h1>
                            <div className="weeksdays-container">
                                <p className={foundUserInformation.availability.monday ? "day-active" : ''}>Lunes</p>
                                <p className={foundUserInformation.availability.tuesday ? "day-active" : ''}>Martes</p>
                                <p className={foundUserInformation.availability.wednesday ? "day-active" : ''}>Miercoles</p>
                                <p className={foundUserInformation.availability.thursday ? "day-active" : ''}>Jueves</p>
                                <p className={foundUserInformation.availability.friday ? "day-active" : ''}>Viernes</p>
                                <p className={foundUserInformation.availability.saturday ? "day-active" : ''}>Sabado</p>
                                <p className={foundUserInformation.availability.sunday ? "day-active" : ''}>Domingo</p>
                            </div>
                        </div>
                    ) : ''}
                <div className="profile-development-container">
                    <section className="filter-container">
                        {!isBlocked.blocked && (
                            <div className="profile-options">
                                {(foundUserInformation.showMyNumber && foundUserInformation.phoneNumber !== null)
                                    ? <div id="profile-phone-number">{foundUserInformation.phoneNumber}</div>
                                    : ''}
                                {mainUsername === username && !isTheUserSuspended ? <Link to="/post/activity"><button id="create-post">Crear una publicacion</button></Link> : ''}
                                {!isTheUserSuspended && <Link to={auth ? '/send/quote' : '/signin'} style={{ textDecoration: 'none' }}><button id="send-quote">Enviar cotizacion</button></Link>}
                            </div>
                        )}
                        {!isBlocked.blocked && (
                            <div className="profile-filter">
                                <select id="main-category" defaultValue={filter.mainCategory} name="mainCategory" onChange={e => searchByFilter(e)}>
                                    <option value="category">CATEGORIA</option>
                                    <option value="Resolver">RESOLVER...</option>
                                    <option value="Explicar">EXPLICAR...</option>
                                    <option value="Tutoria">TUTORIA...</option>
                                    <option value="Curso">CURSO...</option>
                                    <option value="Otros">OTROS</option>
                                </select>
                                <select id="main-subcategory" defaultValue={filter.subCategory} name="mainSubcategory" onChange={e => searchByFilter(e)}>
                                    <option value="subcategory">SUBCATEGORIA</option>
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
                                <input id="subcategory-secondary" placeholder="Busca por subcategorias Personalizadas" onChange={async e => {
                                    if (e.target.value === '') {
                                        const userProducts = await getProducts({ username });
                                        setUserProducts(userProducts);
                                    } else {
                                        document.getElementById('main-category').value = 'category';
                                        document.getElementById('main-subcategory').value = 'subcategory';

                                        setFilter({
                                            mainCategory: 'category',
                                            mainSubcategory: 'subcategory'
                                        });

                                        const products = await filterProducts({ idUser: foundUserInformation._id, customSearch: e.target.value });
                                        setUserProducts(products);
                                    }
                                }} />
                            </div>
                        )}
                    </section>
                    <section className="profile-products-container">
                        <div className="profile-business-hours">
                            <h1 className="business-hours-title">Horario De Atencion</h1>
                            {!isBlocked.blocked && (
                                <div className="weeksdays-container">
                                    <p className={foundUserInformation.availability.monday ? "day-active" : ''}>Lunes</p>
                                    <p className={foundUserInformation.availability.tuesday ? "day-active" : ''}>Martes</p>
                                    <p className={foundUserInformation.availability.wednesday ? "day-active" : ''}>Miercoles</p>
                                    <p className={foundUserInformation.availability.thursday ? "day-active" : ''}>Jueves</p>
                                    <p className={foundUserInformation.availability.friday ? "day-active" : ''}>Viernes</p>
                                    <p className={foundUserInformation.availability.saturday ? "day-active" : ''}>Sabado</p>
                                    <p className={foundUserInformation.availability.sunday ? "day-active" : ''}>Domingo</p>
                                </div>
                            )}
                        </div>
                        <hr />
                        {(!isBlocked.blocked && userProducts.length === 0) && (<h1 style={{ textAlign: 'center', margin: '20px 0', color: '#3282B8', fontSize: '32px' }}>NO HAY PRODUCTOS</h1>)}
                        {isBlocked.blocked && (
                            <div className="profile-blocked">
                                <i className="fas fa-ban"></i>
                                <p>
                                    {
                                        isBlocked.userView === 'from'
                                            ? 'Has bloqueado a este usuario'
                                            : 'Este usuario te ha bloqueado'
                                    }
                                </p>
                            </div>
                        )}
                        {!isBlocked.blocked && (
                            <div className="product-zone">
                                <h1 className="profile-filter-name">CATEGORY</h1>
                                <div className="profile-products">
                                    {(userProducts.length > 0)
                                        ? userProducts.map(product => product.stateActivated === false
                                            ? product.owner === cookies.get('id')
                                                ? <div key={product._id}>
                                                    <Product
                                                        data={{
                                                            uniqueId: product._id,
                                                            image: `url(${product.linkMiniature})`,
                                                            dateOfDelivery: product.dateOfDelivery === null ? 'No definido' : changeDate(product.dateOfDelivery),
                                                            mainCategory: product.category,
                                                            category: product.subCategory,
                                                            title: product.title.slice(0, 30) + '...',
                                                            description: product.description.slice(0, 20) + '...',
                                                            price: product.value === null ? 'Negociable' : `${product.value}$`,
                                                            review: true
                                                        }}
                                                    />
                                                </div>
                                                : <></>
                                            : <div key={product._id}>
                                                <Product
                                                    data={{
                                                        uniqueId: product._id,
                                                        image: `url(${product.linkMiniature})`,
                                                        dateOfDelivery: product.dateOfDelivery === null ? 'No definido' : changeDate(product.dateOfDelivery),
                                                        mainCategory: product.category,
                                                        category: product.subCategory,
                                                        title: product.title.slice(0, 30) + '...',
                                                        description: product.description.slice(0, 20) + '...',
                                                        price: product.value === null ? 'Negociable' : `${product.value}$`
                                                    }}
                                                />
                                            </div>
                                        ) : <></>}
                                </div>
                            </div>
                        )}
                    </section>
                    <section className="advertising-container">
                        <article className="advertising">PUBLICIDAD</article>
                    </section>
                </div>
                {imgSrc && (
                    <div className="select-image-crop-container">
                        <div className="select-image-crop">
                            <h1 className="select-image-title">SELECCIONAR IMAGEN DE PERFIL</h1>
                            <div>
                                <div className="container-crop">
                                    <Cropper
                                        image={imgSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1 / 1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(croppedAreaPercentage, croppedAreaPixels) => {
                                            setCroppedAreaPixels(croppedAreaPixels);
                                        }}
                                        cropSize={cropSize}
                                    />
                                </div>
                                <input type="range" className="zoom-range" value={zoom} min="1" max="3" step="0.1" aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)} />
                            </div>
                            <div className="container-crop-buttons">
                                <button className="save-crop-profile-image" onClick={() => saveCroppedImage()}>Guardar</button>
                                <button className="cancel-crop-profile-image" onClick={() => closeCropArea()}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
                <span ref={newsSpan} className="news-span">!Guardado con exito!</span>
            </div>
        ) : <div className="user-block-container">
                <h1><i className="fas fa-ban"></i> Usuario bloqueado <i className="fas fa-ban"></i></h1>
                <p>Este usuario ha sido bloqueado por los moderadores porque no cumple las politicas del uso de Penssum.</p>
            </div>
    : <div style={{ paddingTop: '40px' }}><Loading margin="auto" /></div>
};

export default Profile;