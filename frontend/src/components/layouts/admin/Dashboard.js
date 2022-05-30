import { useState, useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { 
    getDashboardInformation, 
    getProducts, 
    getUsers, 
    getAllUsers, 
    getTransaction, 
    socket, 
    markNotification,
    getNotifications
} from '../../../api';
import { WeeklyRegisteredUsers, UserState, PublishedProducts } from '../../parts/dashboard/Graphics';
import { changeDate } from '../../helpers/';
import swal from 'sweetalert';

import StatisticsCard from '../../parts/dashboard/StatisticsCard';
import ReviewProduct from './ReviewProduct';
import PreferenceToggle from '../../parts/user/PreferenceToggle';
import FounUser from '../../parts/dashboard/FoundUser';
import PaymentCard from '../../parts/dashboard/PaymentCard';
import DashboardPreferencePart from '../../parts/dashboard/DashboardPreferencePart';
import DashboardPasswordPart from '../../parts/dashboard/DashboardPasswordPart';
import PlainNotification from '../../parts/PlainNotification';
import NotificationSection from '../../parts/NotificationSection';

import Loading from '../../parts/Loading'

function Dashboard({ setProducts }) {
    const [isOpen, setIsOpen] = useState(false);
    const [information, setInformation] = useState(null);
    const [productsToReview, setProductsToReview] = useState(null);
    const [users, setUsers] = useState(null);
    const [transactions,setTransactions] = useState(null);
    const [isOpenPlainNotification, setIsOpenPlainNotification] = useState(false);
    const [countInNotification,setCountInNotification] = useState(0);
    const [notifications,setNotifications] = useState(null);
    const [sendingInformation,setSendingInformation] = useState(false);

    const { attribute } = useParams();
    let menuDashboard = useRef();
    const plainNotificationBell = useRef();

    useEffect(() => {
        const menuDashboardhandler = e => {
            if (!menuDashboard.current.contains(e.target)) {
                setIsOpen(false);
            };
        };

        document.addEventListener('mousedown', menuDashboardhandler);

        const handlerPlainNotification = e => {
            if (!plainNotificationBell.current.contains(e.target)) {
                setIsOpenPlainNotification(false);
            }
        };

        document.addEventListener('mousedown', handlerPlainNotification);

        return (() => {
            document.removeEventListener('mousedown', menuDashboardhandler)
            document.removeEventListener('mousedown', handlerPlainNotification)
        });
    });

    useEffect(() => {
        const obtainCountInformation = async () => {
            const briefNotifications = await getNotifications('Admin');

            let count = 0;

            for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

            setCountInNotification(count);
            setNotifications(briefNotifications);
        };
        obtainCountInformation();
    },[]);

    useEffect(() => {
        const getInformation = async () => {
            const result = await getDashboardInformation();
            setInformation(result);
            const products = await getProducts({ review: true });
            setProductsToReview(products);
            const users = await getUsers();
            setUsers(users);
            const transactions = await getTransaction();
            setTransactions(transactions);
        };
        getInformation();
    }, []);

    useEffect(() => {
        document.querySelectorAll('.dashboard-sections').forEach(section => section.classList.remove('dashboard-active'));
        if (window.innerWidth <= 600) document.querySelector('.dashboard-sections-container').classList.add('dashboard-sections-container-in-mobile');
        else document.querySelector('.dashboard-sections-container').classList.remove('dashboard-sections-container-in-mobile');

        if (attribute === 'mod=general') document.querySelector('.dashboard').classList.add('dashboard-active');
        if (attribute === 'mod=products') document.querySelector('.dashboard-product').classList.add('dashboard-active');
        if (attribute === 'mod=users') document.querySelector('.dashboard-users').classList.add('dashboard-active');
        if (attribute === 'mod=payments') document.querySelector('.dashboard-payments').classList.add('dashboard-active');
        if (attribute === 'mod=rules') document.querySelector('.dashboard-rules').classList.add('dashboard-active');
        if (attribute === 'mod=setting') document.querySelector('.dashboard-setting').classList.add('dashboard-active');
    });

    const searchAllUsers = async () => {
        const value = document.getElementById('search-user-dashboard').value;

        if (value !== '') {
            setSendingInformation(true);
            const result = await getAllUsers(value);

            if (result.error) setUsers(null)
            else setUsers(result);
            
            setTimeout(() => setSendingInformation(false),800);
        };        
    };
    
    const sendMessageToEachUser = () => {
        swal({
            title: 'ESCRIBE EL MENSAJE',
            content: {
                element: "input",
                attributes: {
                    placeholder: "Mensaje para todos los usuarios",
                    type: "text",
                },
            },
            button: 'Enviar'
        }).then((value) => {
            if (value === null) return

            if (value) {
                socket.emit('send_message_to_each_user', value);
                socket.emit('received event');

                swal({
                    title: 'Enviado',
                    text: 'Mensaje enviado con exito.',
                    icon: 'success',
                    timer: '2000',
                    button: false,
                });
            };
        });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-sections-container">
                <h1 className="dashboard-sections-title"><i className="fas fa-smile-beam"></i>Admin</h1>
                <hr />
                <Link to="/dashboard/mod=general" className="dashboard-sections dashboard">
                    <i className="fas fa-tachometer-alt"></i>
                    <p>Dashboard</p>
                </Link>
                <hr />
                <div>
                    <p className="dashboard-divider-title">CONTROL</p>
                    <div>
                        <Link to="/dashboard/mod=products" className="dashboard-sections dashboard-product">
                            <i className="fas fa-boxes"></i>
                            <p>Productos {information === null ? '' : information.productsToReview === 0 ? '' : <span id="dashboard-product-account">{information.productsToReview}</span>}</p>
                        </Link>
                        <Link to="/dashboard/mod=users" className="dashboard-sections dashboard-users">
                            <i className="fas fa-users"></i>
                            <p>Usuarios</p>
                        </Link>
                        <Link to="/dashboard/mod=payments" className="dashboard-sections dashboard-payments">
                            <i className="fas fa-file-invoice-dollar"></i>
                            <p>Pagos {transactions === null ? '' : transactions.length === 0 ? '' : <span id="dashboard-payments-account">{transactions.length}</span>}</p>
                        </Link>
                    </div>
                </div>
                <hr />
                <div>
                    <h4 className="dashboard-divider-title">AVANZADO</h4>
                    <div>
                        {/*<Link to="/dashboard/mod=rules" className="dashboard-sections dashboard-rules">
                            <i className="fas fa-ruler-combined"></i>
                            <p>Reglas</p>
                        </Link>*/}
                        <Link to="/dashboard/mod=setting" className="dashboard-sections dashboard-setting">
                            <i className="fas fa-cog"></i>
                            <p>Configuracion</p>
                        </Link>
                        {/*<Link to="/dashboard/mod=tools" className="dashboard-sections">
                            <i className="fas fa-tools"></i>
                            <p>Herramientas</p>
                        </Link>*/}
                    </div>
                </div>
            </div>
            {productsToReview !== null && information !== null && transactions !== null 
                ? (
                    <div className="main-dashboard-section">
                    <nav className="dashboard-nav">
                        <div ref={menuDashboard}>
                            <div className="main-dashboard-icon">
                                <div ref={plainNotificationBell}>
                                    <div className="user-span-container" onClick={() => {
                                        if (countInNotification > 0) markNotification('Admin');
                                        setCountInNotification(0);
                                        setIsOpenPlainNotification(!isOpenPlainNotification)
                                    }}>
                                        <i className="fas fa-bell" id="bell-dashboard"></i>
                                        {countInNotification > 0 ? <span className="user-count">{countInNotification > 3 ? '+3' : countInNotification}</span> : ''}
                                    </div>
                                    <div className="plain-notification-dashboard-container" style={{ display: isOpenPlainNotification ? 'block' : 'none' }}>
                                        {notifications !== null && notifications.length > 0
                                            ? notifications.map((notification,index) => (index < 3) && (
                                                    <div key={notification._id}>
                                                        <Link to="/dashboard/mod=notifications" style={{ textDecoration: 'none' }} onClick={() => setIsOpenPlainNotification(false)}>
                                                            <PlainNotification
                                                                title={notification.title}
                                                                description={notification.description}
                                                                color={notification.color}
                                                                image={notification.image}
                                                            />
                                                        </Link>
                                                    </div>
                                                )
                                            ) : <p className="thereAreNoPlainNotification">No hay notificaciones</p>}
                                        {notifications !== null && notifications.length > 0 ? <Link to="/dashboard/mod=notifications" className="notification-view" onClick={() => setIsOpenPlainNotification(false)}>Ver todas las notificaciones</Link> : ''}
                                    </div>
                                </div>
                                {/*<div>
                                    <i className="fas fa-envelope"></i>
                                    <span id="message-active-dashboard"></span>
                                </div>*/}
                                <i className="fas fa-user-circle" onClick={() => setIsOpen(!isOpen)}></i>
                            </div>
                            <div className="options-dashboard" style={{ display: isOpen ? 'flex' : 'none' }}>
                                <div className="options-divider-dashboard">
                                    <Link to="/dashboard/mod=general" className="option-link-dashboard"><i className="fas fa-user-alt"></i> Perfil</Link>
                                </div>
                                <div className="options-divider-dashboard">
                                    <Link to="/dashboard/mod=setting" className="option-link-dashboard"><i className="fas fa-cog"></i> Configuraciones</Link>
                                </div>
                                {/*<div className="options-divider-dashboard">
                                    <Link to="/" className="option-link-dashboard"><i className="fa-solid fa-chart-line"></i> Actividad</Link>
                                </div>*/}
                                <hr />
                                <div className="options-divider-dashboard">
                                    <Link to="/" className="option-link-dashboard"><i className="fas fa-sign-out-alt"></i> Salir</Link>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <i className="fas fa-chevron-left" id="fa-chevron-left-dashboard" onClick={() => document.querySelector('.dashboard-sections-container').classList.remove('dashboard-sections-container-in-mobile')}></i>
                    {attribute === 'mod=general'
                        ? <div className="commomStylePadding dashboard-general">
                            <div className="main-header-dashboard">
                                <h1>Bienvenido {information !== null ? information.name : ''}</h1>
                                {/*<button><i className="fas fa-download"></i>Generar Reporte</button>*/}
                            </div>
                            <div className="statistics-card-container">
                                <StatisticsCard color="#2c373d" name="Usuarios" information={information === null ? '...' : information.totalUsers} icono="fas fa-users" />
                                <StatisticsCard color="#0F4C75" name="Productos" information={information === null ? '...' : information.totalProducts} icono="fas fa-boxes" />
                                <StatisticsCard color="#06a1c4" name="Ofertas concretadas" information={information === null ? '...' : information.concreteOffers} icono="far fa-handshake" />
                                <StatisticsCard color="#ffa600" name="Productos a revisar" information={information === null ? '...' : information.productsToReview} icono="fas fa-history" />

                                <StatisticsCard color="#009e00" name="Videollamadas concretadas" information={information === null ? '...' : information.videoCallsMade} icono="fas fa-video" />
                                <StatisticsCard color="#830163" name="Violaciones de normas" information={information === null ? '...' : information.violationsTotal} icono="fas fa-exclamation-triangle" />
                                <StatisticsCard color="#970000" name="Visitas a Protech" information={information === null ? '...' : (information.totalViews >= 1000 && information.totalViews <= 1000000) ? `${(information.totalViews * 0.001).toFixed(1)}K` : information.totalViews} icono="fas fa-eye" />
                                <StatisticsCard color="#3282B8" name="Reportes" information={information === null ? '...' : information.reports} icono="fas fa-sticky-note" />
                            </div>
                            <div>
                                <div className="graphics-container">
                                    <div className="WeeklyRegisteredUsers">
                                        <WeeklyRegisteredUsers registeredUsers={information === null ? [0, 0, 0, 0, 0, 0, 0] : information.registeredUsers} />
                                    </div>
                                    <div className="UserState">
                                        <UserState state={information === null ? [0, 0, 0] : information.usersStatus} />
                                    </div>
                                </div>
                                <div className="graphics">
                                    <PublishedProducts currentProducts={information === null ? [0, 0, 0, 0, 0, 0, 0] : information.currentProducts} lastProducts={information === null ? [0, 0, 0, 0, 0, 0, 0] : information.lastProducts} />
                                </div>
                            </div>
                        </div>
                        : attribute === 'mod=products'
                            ? <div>
                                <div className="commomStylePadding dashboard-products">
                                    {productsToReview !== null && productsToReview.length > 0
                                        ? productsToReview.map(product => {
                                            return (
                                                <div key={product._id + product.title.length * 5}>
                                                    <ReviewProduct
                                                        data={{
                                                            id: product._id,
                                                            onwer: product.owner,
                                                            product,
                                                            image: `url(${product.linkMiniature})`,
                                                            dateOfDelivery: product.dateOfDelivery === null ? 'No definido' : changeDate(product.dateOfDelivery),
                                                            mainCategory: product.category,
                                                            category: product.subCategory,
                                                            title: product.title.slice(0, 30) + '...',
                                                            description: product.description.slice(0, 20) + '...',
                                                            price: product.value === null ? 'Negociable' : `${product.value}$`,
                                                            setProductsToReview,
                                                            information,
                                                            setInformation,
                                                            setProducts
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }) : <></>}
                                </div>
                                {productsToReview === null || productsToReview.length === 0 ? <h1 className="thereAreNoProductsInDashboard">NO HAY PRODUCTOS A REVISAR</h1> : <></>}
                            </div>
                            : attribute === 'mod=users'
                                ? <div className="commomStylePadding dashboard-users">
                                    <div className="header-users-dashboard">
                                        <div className="search-user-dashboard-container">
                                            <input type="text" id="search-user-dashboard" placeholder="Buscar usuarios"
                                                onChange={async e => {
                                                    if (e.target.value === '') {
                                                        const users = await getUsers();
                                                        setUsers(users);
                                                    }
                                                }}
                                            />
                                            <i 
                                                className="fas fa-search" 
                                                id="dashboard-user-search" 
                                                style={{ 
                                                    background: sendingInformation ? '#3282B8' : '', 
                                                    opacity: sendingInformation ? '.4' : '', 
                                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                                }} 
                                                onClick={() => { if (!sendingInformation) searchAllUsers() }}
                                            ></i>
                                        </div>
                                        <div className="dashboard-user-section-option">
                                            <i className="fas fa-envelope-open-text" title="Enviar mensajes a todos los usuarios" onClick={() => sendMessageToEachUser()}></i>
                                        </div>
                                    </div>
                                    <div className="found-users-container">
                                        {users !== null && users.length > 0
                                            ? users.map(user => {
                                                return (
                                                    <div key={user._id + user.username + changeDate(user.creationDate)}>
                                                        <FounUser
                                                            id={user._id}
                                                            username={user.username}
                                                            date={changeDate(user.creationDate)}
                                                            setUsers={setUsers}
                                                            data={{
                                                                property: `${user._id}-information-dashboard`,
                                                                registered: user.registered,
                                                                objetive: user.objetive,
                                                                email: user.email,
                                                                firstName: user.firstName,
                                                                secondName: user.secondName,
                                                                lastName: user.lastName,
                                                                secondSurname: user.secondSurname,
                                                                description: user.description,
                                                                profilePicture: user.profilePicture,
                                                                coverPhoto: user.coverPhoto,
                                                                identification: user.identification,
                                                                yearsOfExperience: user.yearsOfExperience,
                                                                phoneNumber: user.phoneNumber,
                                                                availability: user.availability,
                                                                virtualClasses: user.virtualClasses,
                                                                faceToFaceClasses: user.faceToFaceClasses,
                                                                showMyNumber: user.showMyNumber,
                                                                typeOfUser: user.typeOfUser,
                                                                validated: user.validated
                                                            }}
                                                            setProducts={setProducts}
                                                        />
                                                    </div>
                                                );
                                            }) : <h1 className="thereAreNoUsersInDashboard">NO HAY USUARIOS EN LA APLICACION</h1>}
                                    </div>
                                </div>
                                : attribute === 'mod=payments' 
                                    ?   <div className="commomStylePadding dashboard-payments">
                                            <h2 className="dashboard-payments-title">PAGOS PENDIENTES</h2>
                                            <div className="dashboard-payments-card-container">
                                                <div className="payment-card-dashboard-container">
                                                    {transactions !== null && transactions.length > 0 
                                                        ? transactions.map(transaction => {
                                                            return (
                                                                <div key={transaction.transactionId}>
                                                                    <PaymentCard
                                                                        id={transaction._id}
                                                                        amount={transaction.amount}
                                                                        bank={transaction.bank}
                                                                        accountNumber={transaction.accountNumber}
                                                                        accountType={transaction.accountType}
                                                                        userId={transaction.userId}
                                                                        ownerId={transaction.ownerId}
                                                                        productId={transaction.productId}
                                                                        orderId={transaction.orderId}
                                                                        transactionId={transaction.transactionId}
                                                                        operationDate={transaction.operationDate}
                                                                        paymentType={transaction.paymentType}
                                                                        paymentNetwork={transaction.paymentNetwork}
                                                                        setTransaction={setTransactions}
                                                                        transactions={transactions}
                                                                    />
                                                                </div>
                                                            )
                                                        })
                                                        : <h2 className="thereAreNoPayments">NO HAY PAGOS PENDIENTES</h2>}
                                                </div>
                                            </div>
                                        </div> 
                                    : attribute === 'mod=rules'
                                        ? <div className="commomStylePadding dashboard-rules">
                                            <PreferenceToggle h4="Permitir revicion de productos" p="Permite la revicion de productos, si esta desactivado los productos se publicaran sin necesidad de revicion" idContainer="allowProductReview" idButton="buttonAllowProductReview" />
                                            <PreferenceToggle h4="Permitir videollamadas" p="Bloquea las reuniones por videollamadas en la plataforma" idContainer="allowVideoCall" idButton="buttonAllowVideoCall" />
                                        </div>
                                        : attribute === 'mod=tools'
                                            ? <div className="commomStylePadding dashboard-tools"></div>
                                            : attribute === 'mod=setting'
                                                ?   <div className="commomStylePadding dashboard-setting">
                                                        <DashboardPreferencePart
                                                            name="name"
                                                            property="Nombre"
                                                            value={information !== null ? information.name : ''}
                                                            id="name"
                                                            idInput="name-dashboard-preference"
                                                            inputType="text"
                                                            placeholder="¿Como quiere que lo llamemos?"
                                                            information={information}
                                                            setInformation={setInformation}
                                                        />
                                                        <DashboardPreferencePart
                                                            name="firstEmail"
                                                            property="Primer correo"
                                                            value={information !== null ? information.firstEmail : ''}
                                                            id="firstEmail"
                                                            idInput="firstEmail-dashboard-preference"
                                                            inputType="email"
                                                            placeholder="Escriba el nuevo correo principal"
                                                            information={information}
                                                            setInformation={setInformation}
                                                        />
                                                        <DashboardPasswordPart
                                                            property="Cambiar contraseña principal" 
                                                            i="fab fa-keycdn" 
                                                            description="Elige una contraseña principal segura para que puedas entrar desde el login." 
                                                            id="edit-password"
                                                            typePassword={1}
                                                        />
                                                        <DashboardPreferencePart
                                                            name="secondEmail"
                                                            property="Segundo correo"
                                                            value={information !== null ? information.secondEmail : ''}
                                                            id="secondEmail"
                                                            idInput="secondEmail-dashboard-preference"
                                                            inputType="email"
                                                            placeholder="Escriba el nuevo correo segundario"
                                                            information={information}
                                                            setInformation={setInformation}
                                                        />
                                                        <DashboardPasswordPart
                                                            property="Cambiar contraseña segundaria" 
                                                            i="fab fa-keycdn" 
                                                            description="Elige una contraseña segundaria segura para que puedas entrar en la segunda capa de seguridad." 
                                                            id="edit-password"
                                                            typePassword={2}
                                                        />
                                                        <DashboardPreferencePart
                                                            name="keyword"
                                                            property="Palabra clave"
                                                            value={information !== null ? information.keyword : ''}
                                                            id="keyword"
                                                            idInput="keyword-dashboard-preference"
                                                            inputType="text"
                                                            placeholder="Escriba la nueva palabra clave"
                                                            information={information}
                                                            setInformation={setInformation}
                                                        />
                                                    </div>
                                                : attribute === 'mod=notifications' 
                                                    ?   <div className="commomStylePadding">
                                                            <div className="notifications-dashboard-container">
                                                                <h1>NOTIFICACIONES</h1>
                                                                <div className="notifications-dashboard-section">
                                                                    {notifications !== null
                                                                        ? notifications.length > 0
                                                                            ? notifications.map(notification => {
                                                                                return (
                                                                                    <div key={notification._id}>
                                                                                        <NotificationSection
                                                                                            productId={notification.productId}
                                                                                            username={notification.username}
                                                                                            title={notification.title}
                                                                                            creationDate={notification.creationDate}
                                                                                            description={notification.description}
                                                                                            files={notification.files}
                                                                                            admin={true}
                                                                                        />
                                                                                    </div>
                                                                                )
                                                                            }) : <h1 className="thereAreNoNotifications">NO HAY NOTIFICACIONES</h1>
                                                                        : <Loading margin="auto" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    : <Navigate to="/dashboard/mod=general" />}
                    </div>
                ) : <Loading 
                        center={true}
                        background={true} 
                        optionText={{
                            text: "...Cargando Informacion...", 
                            colorText: "#FFFFFF",
                            fontSize: '26px'
                    }}/>}
        </div>
    );
};

export default Dashboard;