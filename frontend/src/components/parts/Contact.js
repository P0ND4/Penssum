import { socket, reviewBlocked } from '../../api';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Contact({ active, username, firstName, lastName, time, message, idUser, setContactActive, setIsBlocked }) {
    
    async function changeWatching (){
        const blockResult = await reviewBlocked({ from: cookies.get('id'), to: idUser });

        if (blockResult.length > 0) setIsBlocked({ blocked: true, userView: (blockResult[0].from === cookies.get('id') ? 'from' : 'to') })
        else setIsBlocked({ blocked: false, userView: null });

        const recents = document.querySelectorAll('.recent-message');
        recents.forEach(recent => recent.classList.remove('message-watching'));

        document.querySelector(`.recent-message-${idUser}`).classList.add('message-watching');
        socket.emit('get_messages', cookies.get('id'), idUser);
        
        setContactActive({ idUser, firstName, lastName, username });
    };

    return (
        <div className={`recent-message recent-message-${idUser}`} onClick={() => changeWatching()}>
            <div className={`user-connection ${active}`}></div>
            <div className="brief-information">
                <div className="message-name-and-time">
                    <h2>{firstName === '' ? username === undefined ? '' : username.slice(0,14) + '...' : `${firstName} .${lastName === undefined ? '' : lastName.slice(0,1)}`}</h2>
                    <p>{time}</p>
                </div>
                <p className="short-paragrahp">{message.slice(0, 20) + '...'}</p>
            </div>
        </div>
    );
};

export default Contact;