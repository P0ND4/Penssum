import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import { socket, getUser, markUncheckedMessages } from '../../../api';
import Cookies from 'universal-cookie';
import Contact from '../../parts/Contact';

const cookies = new Cookies();

function Messages() {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messageArrival, setMessageArrival] = useState(null);
    const [contactActive, setContactActive] = useState(null);
    const [isBlocked, setIsBlocked] = useState({ blocked: false, userView: null });

    let currentContacts = useRef([]).current;

    const defineContact = async (responseObtained) => {
        if (responseObtained.length > 0) {
            for (let i = 0; i < responseObtained.length; i++) {

                const compare = responseObtained[i].receiver === cookies.get('id') ? responseObtained[i].transmitter : responseObtained[i].receiver;

                if (currentContacts.indexOf(compare) === -1) {
                    currentContacts.push(responseObtained[i].receiver === cookies.get('id')
                        ? responseObtained[i].transmitter
                        : responseObtained[i].receiver)

                    const result = await getUser({
                        id: responseObtained[i].receiver === cookies.get('id')
                            ? responseObtained[i].transmitter
                            : responseObtained[i].receiver
                    });

                    const mainData = {
                        user: result._id,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        username: result.username,
                        message: responseObtained[i].message,
                        messageCreation: responseObtained[i].creationDate
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

    useEffect(() => {
        socket.on('contacts', contactsObtained => defineContact(contactsObtained));
        socket.on('messages', messagesObtained => setMessages(messagesObtained));
        socket.on('new_message', message => {
            if (contactActive !== null && contactActive.idUser === message.transmitter) {
                setMessages([...messages, message]);
                setMessageArrival(message);
            };
        });

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
                    ? <div className="recent-messages">
                        {contacts.map((contact, index) => {
                            return (
                                <div key={contact.messageCreation + contact.firstName + index}>
                                    <Contact active="connected-user"
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
                            <Link to={`/${contactActive === null ? '' : contactActive.username}`} style={{ textDecoration: 'none' }}><h1 className="message-header-title">{contactActive === null ? 'Cargando...' : contactActive.firstName === '' ? contactActive.username : `${contactActive.firstName} .${contactActive.lastName.slice(0, 1)}`}</h1></Link>
                            <div className="message-header-icon">
                                {!isBlocked.blocked ? <i className="fas fa-ban" title="Bloquear"></i> : ''}
                                <i className="fas fa-trash-alt" title="Eliminar Chat"></i>
                            </div>
                        </div>
                        <div className="message-content">
                            <div className="messages">
                                <div className="messages-by-date">
                                    {/*<h1 className="message-date">18/01/2022</h1>*/}
                                    {messages.map(message => {
                                        return (
                                            <div className={defineUser(message.transmitter, message.receiver)}>
                                                <p>{message.message}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {!isBlocked.blocked
                            ? (
                                <form className="send-message" onClick={e => sendMessage(e)}>
                                    <input type="text" id="input-message" placeholder="Escriba el mensaje" />
                                    <button id="send-message"><i className="fas fa-paper-plane"></i></button>
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