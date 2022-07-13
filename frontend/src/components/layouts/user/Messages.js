import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom'
import { socket, getUser, markUncheckedMessages, getProducts, getNotifications, blockUser } from '../../../api';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';
import Contact from '../../parts/Contact';

const cookies = new Cookies();

function Messages({ setProducts, setNotifications, setCountInNotification }) {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messageArrival, setMessageArrival] = useState(null);
    const [contactActive, setContactActive] = useState(null);
    const [isBlocked, setIsBlocked] = useState({ blocked: false, userView: null });
    const [isActiveContact,setIsActiveContact] = useState(false);
    const [width,setWidth] = useState(window.innerWidth);

    const changeWidth = () => setWidth(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', changeWidth);
        return (() => window.removeEventListener('resize', changeWidth));
    });

    let currentContacts = useRef([]).current;

    const defineContact = async (responseObtained) => {
        if (responseObtained.length > 0) {
            for (let i = 0; i < responseObtained.length; i++) {

                const compare = responseObtained[i].receiver === cookies.get('id') ? responseObtained[i].transmitter : responseObtained[i].receiver;

                if (currentContacts.indexOf(compare) === -1) {
                    currentContacts.push(responseObtained[i].receiver === cookies.get('id')
                        ? responseObtained[i].transmitter
                        : responseObtained[i].receiver)

                    let result;

                    if (responseObtained[i].transmitter !== 'Admin') {
                        result = await getUser({
                            id: responseObtained[i].receiver === cookies.get('id')
                                ? responseObtained[i].transmitter
                                : responseObtained[i].receiver
                        });
                    };

                    const mainData = {
                        user: responseObtained[i].transmitter !== 'Admin' ? result._id : 'Admin',
                        firstName: responseObtained[i].transmitter !== 'Admin' ? result.firstName : '',
                        lastName: responseObtained[i].transmitter !== 'Admin' ? result.lastName : '',
                        username: responseObtained[i].transmitter !== 'Admin' ? result.username : 'Admin',
                        message: responseObtained[i].message,
                        messageCreation: responseObtained[i].creationDate,
                        active: responseObtained[i].transmitter !== 'Admin' ? responseObtained[i].active : 'Admin'
                    };
                    
                    setContacts(prev => [...prev, mainData]);
                };
            };
        };
    };

    useEffect(() => {
        socket.emit('get_contact', cookies.get('id'));
        markUncheckedMessages(cookies.get('id'));

        return () => { socket.off() };
    }, [messageArrival]);

    const searchNotifications = useCallback(
        async () => {
            const briefNotifications = await getNotifications(cookies.get('id'));

            const currentNotification = [];
            let count = 0;

            for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
            for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

            setCountInNotification(count);
            setNotifications(currentNotification);
        },[setCountInNotification,setNotifications]
    );

    useEffect(() => {
        socket.on('contacts', contactsObtained => defineContact(contactsObtained));
        socket.on('messages', messagesObtained => setMessages(messagesObtained));
        socket.on('new_message', message => {
            socket.emit('get_contact', cookies.get('id'));
            if (contactActive !== null && contactActive.idUser === message.transmitter) {
                setMessages([...messages, message]);
                setMessageArrival(message);
            };
        });
        socket.on('block', from => {
            if (contactActive !== null && contactActive.idUser === from) {
                setIsBlocked({ blocked: true, userView: 'to' });   
            }
        });
        socket.on('unlocked', from => {
            if (contactActive !== null && contactActive.idUser === from) {
                setIsBlocked({ blocked: false, userView: null });
            }
        });
        socket.on('received event', async () => await searchNotifications());

        return () => { socket.off() };
    });

    useEffect(() => {
        if (document.querySelector('.messages')) document.querySelector('.messages').scrollTop = '9999999999';
    }, [messages]);

    const sendMessage = e => {
        e.preventDefault();
        const inputText = document.getElementById('input-message');
        if (inputText.value !== '') {
            const value = inputText.value;
            setMessages(prev => [...prev, { transmitter: cookies.get('id'), receiver: contactActive.idUser, message: value }]);
            socket.emit('send_message', cookies.get('id'), contactActive.idUser, value);
        };
        inputText.value = '';
    };

    const defineUser = (transmitter, receiver) => {
        if (transmitter === cookies.get('id')) {
            return 'user-two';
        } else if (receiver === cookies.get('id')) {
            return 'user-one';
        };

        return
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

                if (!result.error) {
                    const products = await getProducts({ blockSearch: cookies.get('id') });
                    setProducts(products);
                    await searchNotifications();

                    setIsBlocked({ blocked: true, userView: 'from' });
                    socket.emit('send_block', { from, to });

                    swal({
                        title: 'Usuario Bloqueado',
                        text: 'El usuario ha sido bloqueado con exito.',
                        icon: 'success',
                        timer: '2000',
                        button: false,
                    });

                    socket.emit('received event', to);
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

    return (
        <div className="messages-container">
            <div className="inbox">
                {contacts.length === 0
                    ? <div className="thereAreNoContact">
                        <h1 style={{ margin: '5px 0', textAlign: 'center', color: "#FFFFFF" }}>No hay contactos</h1>
                        <p style={{ color: '#CCCCCC', textAlign: 'center' }}>Cuando alguien te escriba o inicies una converzacion aparecera aqui.</p>
                    </div>
                    : <></>}
                {contacts.length > 0
                    ? <div className="recent-messages" style={{ transform: isActiveContact && width <= 700 ? 'translateX(-1000px)' : 'translateX(0)' }}>
                        {contacts.map((contact, index) => {
                            return (
                                <div key={contact.messageCreation + contact.firstName + index} onClick={() => {
                                    setIsActiveContact(true);
                                }}>
                                    <Contact 
                                        active={contact.active === null ? '' : 'connected-user'}
                                        idUser={contact.user}
                                        firstName={contact.firstName}
                                        lastName={contact.lastName}
                                        username={contact.username}
                                        time="Hace 1 dia"
                                        message={contact.message}
                                        setContactActive={setContactActive}
                                        setIsBlocked={setIsBlocked}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    : <></>}

                {messages.length > 0
                    ? <div className="message">
                        <div className="message-header">
                            <div className="message-header-main">
                                {width <= 700 && <i className="fa-solid fa-bars" onClick={()=> setIsActiveContact(false)}></i>}
                                <Link to={`/${contactActive === null || contactActive.username === undefined ? '' : contactActive.username === 'Admin' ? 'messages' : contactActive.username}`} style={{ textDecoration: 'none' }}><h1 className="message-header-title">{contactActive === null ? 'Cargando...' : contactActive.firstName === undefined || contactActive.firstName === '' || contactActive.firstName === null ? contactActive.username === undefined || contactActive.username === null ? 'ELIMINADO' : contactActive.username : `${contactActive.firstName} .${contactActive.lastName === undefined ? '' : contactActive.lastName.slice(0, 1)}`}</h1></Link>
                            </div>
                            <div className="message-header-icon">
                                {!isBlocked.blocked && contactActive !== null && contactActive.username !== 'Admin' && contactActive.username !== undefined ? <i className="fas fa-ban" title="Bloquear" onClick={() => block(cookies.get('id'), contactActive.idUser)}></i> : ''}
                                {/*<i className="fas fa-trash-alt" title="Eliminar Chat"></i>*/}
                            </div>
                        </div>
                        <div className="message-content">
                            <div className="messages">
                                <div className="messages-by-date">
                                    {/*<h1 className="message-date">18/01/2022</h1>*/}
                                    {messages.map((message,index) => {
                                        return (
                                            <div key={message._id ? message._id : index} className={defineUser(message.transmitter, message.receiver)}>
                                                <p>{message.message}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {!isBlocked.blocked
                            ? contactActive !== null && contactActive.username !== 'Admin' && contactActive.username !== undefined && (
                                <form className="send-message" onSubmit={e => sendMessage(e)}>
                                    <input type="text" id="input-message" placeholder="Escriba el mensaje" />
                                    <button id="send-message" onClick={e => sendMessage(e)}><i className="fas fa-paper-plane"></i></button>
                                </form>
                            ) : (
                                <div className="message-blocked">
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
                    </div>
                    : <></>}
            </div>
        </div>
    );
};

export default Messages;