import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, getOffer, socket } from '../../../api';
import Peer from 'simple-peer';
import Cookies from 'universal-cookie';
import swal from 'sweetalert';

import Loading from '../../parts/Loading';

const cookies = new Cookies();

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, [props.peer]);

    return (
        <video playsInline autoPlay ref={ref} hidden={props.hidden} muted={props.muted} className={props.className && (props.className)} />
    );
}

function VideoCall({ userInformation }) {
    const [exists,setExists] = useState(false);
    const [peers, setPeers] = useState([]);
    const [areThereCalls,setAreThereCalls] = useState(false);
    const [callAccepted,setCallAccepted] = useState(false);
    const [userInRoom,setUserInRoom] = useState(false);
    const [permission,setPermission] = useState(false);

    const [isVideo,setIsVideo] = useState(false);
    const [isAudio,setIsAudio] = useState(false);

    const navigate = useNavigate();

    /*const [audioSource,setAudioSource] = useState('');
    const [videoSource,setVideoSource] = useState('');*/

    const { meeting_id } = useParams();

    const timer = useRef();
    const userVideo = useRef();
    const calls = useRef([]);
    const peersRef = useRef([]);
    const roomID = meeting_id;

    const owner = useRef(null);

    useEffect(() => {
        const checkPermission = cookies.get("camera permission");
        if (checkPermission) setPermission(true);
    },[]);

    useEffect(() => {
        const videoCallValidation = async () => {
            const product = await getProducts({ videoCallURL: roomID });
            if (product) {
                owner.current = product.owner;
                setExists(true);
                const user = await getOffer({ id_user: userInformation._id, id_product: product._id });
                if (userInformation._id !== product.owner && (user.error || user.acceptOffer === false) && product.takenBy !== userInformation._id) navigate('/');
            } else navigate('/');
        };
        videoCallValidation();
    },[userInformation,roomID,navigate]);

    useEffect(() => socket.emit('user in room', roomID),[roomID]);

    useEffect(() => {
        socket.on('user error in videocall', () => {
            console.log('Usuario en videollamada');
        });

        // TAREA FINAL, HACER LA PRUEBA CON VARIOS USUARIOS

        socket.on('user disconnected', ({ userID, socketID, from }) => {
            if (from === 'teacher') {
                if (cookies.get("id") === userID) {
                    userVideo.current.srcObject.getTracks().forEach(track => track.stop());
                    navigate('/');
                };
            };

            const peers = peersRef.current.filter(peer => peer.userID !== socketID);

            console.log(peers);

            setPeers(peers);
            peersRef.current.forEach((peer,index) => (peer.peerID === socketID) && peersRef.current.splice(index,1));
        });

        socket.on('call accepted', () => { setCallAccepted(true); });
        socket.on('call denied', () => console.log('Acceso denegado'));

        socket.on('teacher not connected', () => {
            console.log('Maestro no connectado');
        });

        socket.on('receiving call', ({ from, name, profilePicture }) => {
            !calls.current.some(call => call.from === from) &&
                calls.current.push({ from, name, profilePicture });

            setAreThereCalls(true);
        });

        socket.on('get calls', ({ room }) => {
            if (room === roomID && userInformation._id !== owner.current) {
                socket.emit('call teacher', { 
                    teacherToCall: owner.current,
                    from: cookies.get('id'), 
                    name: userInformation.firstName === '' ? userInformation.username : `${userInformation.firstName} ${userInformation.lastName}`, 
                    profilePicture: userInformation.profilePicture
                });
            };
        });
    },[userInformation,roomID,navigate]);

    const createPeer = useCallback(
        (userToSignal, callerID, stream) => {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
            });
            
            peer.on("signal", signal => {
                socket.emit("sending signal", {
                    userToSignal, 
                    callerID, 
                    signal, 
                    userID: cookies.get('id'),
                    media: {
                        profilePicture: userInformation.profilePicture,
                        video: isVideo,
                        audio: isAudio
                    },
                    names: {
                        username: userInformation.username,
                        firstName: userInformation.firstName,
                        lastName: userInformation.lastName
                    }
                });
            });

            peer.on('close', () => peer.destroy());

            return peer;
        },[isAudio, isVideo,userInformation]
    );

    useEffect(() => {
        const permissionToStream = () => {
            if (!userInRoom && owner.current) {
                /*const constraints = {
                audio: { devideId: audioSource !== '' ? { exact: audioSource } : undefined },
                video: { devideId: videoSource !== '' ? { exact: videoSource } : undefined }
            };*/

                navigator.mediaDevices.getUserMedia(/*constraints*/{ video: true, audio: true }).then(stream => {
                    cookies.set('camera permission', 'permissions granted', { path: '/' });
                    if (userInformation._id === owner.current) socket.emit('request pending calls', { roomID });
                    userVideo.current.srcObject = stream;
                    if (callAccepted || userInformation._id === owner.current) {
                        socket.emit("join room", { roomID, userID: cookies.get('id'), media: { video: isVideo, audio: isAudio }});
                        socket.on("all users", users => {
                            const peers = [];
                            users.forEach(user => {
                                const peer = createPeer(user.socketID, socket.id, stream);
                                
                                const dataToSave = {
                                    media: {
                                        profilePicture: user.media.profilePicture,
                                        video: user.media.video,
                                        audio: user.media.audio
                                    },
                                    names: {
                                        username: user.names.username,
                                        firstName: user.names.firstName,
                                        lastName: user.names.lastName
                                    },
                                    userID: user.userID,
                                    peerID: user.socketID,
                                    peer,
                                };

                                peersRef.current.push(dataToSave)
                                peers.push(dataToSave);
                            })
                            setPeers(peers);
                            setUserInRoom(true);
                        });

                        socket.on("user joined", payload => {
                            const peer = addPeer(payload.signal, payload.callerID, stream);

                            const dataToSave = {
                                media: {
                                    profilePicture: payload.media.profilePicture,
                                    video: payload.media.video,
                                    audio: payload.media.audio
                                },
                                names: {
                                    username: payload.names.username,
                                    firstName: payload.names.firstName,
                                    lastName: payload.names.lastName
                                },
                                userID: payload.userID,
                                peerID: payload.callerID,
                                peer,
                            };

                            peersRef.current.push(dataToSave);

                            setPeers(users => [...users, dataToSave]);
                        });

                        socket.on('change user property', ({ userID, property, value }) => {
                            const updatedPeer = []; 

                            if (userID === cookies.get('id')) {
                                if (property === 'video') setIsVideo(value);
                                if (property === 'audio') setIsAudio(value);
                            };

                            peersRef.current.forEach(peer => {
                                if (peer.userID === userID) {
                                    peer.media[property] = value;
                                    updatedPeer.push(peer);
                                } else updatedPeer.push(peer);
                            });

                            peersRef.current = updatedPeer;
                            setPeers(updatedPeer);
                        });

                        socket.on("receiving returned signal", payload => {
                            const item = peersRef.current.find(p => p.peerID === payload.id);
                            item.peer.signal(payload.signal);
                        });
                    } else { 
                        socket.emit('call teacher', { 
                            teacherToCall: owner.current,
                            from: cookies.get('id'), 
                            name: userInformation.firstName === '' ? userInformation.username : `${userInformation.firstName} ${userInformation.lastName}`, 
                            profilePicture: userInformation.profilePicture 
                        }); 
                    };
                }).catch(e => {
                    console.log('there was a mistake trying again: ', e.message);
                    if (e.message === 'Permission denied') cookies.set('camera permission', 'Permission denied', { path: '/' });
                });
            };
        };
        
        if (permission) permissionToStream();
    }, [roomID,callAccepted,userInformation,isAudio,isVideo,createPeer,userInRoom,permission]);

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("returning signal", { signal, callerID })
        })

        peer.on('close', () => peer.destroy());

        peer.signal(incomingSignal);

        return peer;
    }

    const buttonValidation = ({ isAccepted, id }) => {
        calls.current.splice(0,1);
        if (calls.current.length === 0) setAreThereCalls(false);
        socket.emit('call status', { id, isAccepted });
    }

    const changeVideoCallProperty = ({ property, value }) => {
        clearTimeout(timer.current)

        if (property === 'video') setIsVideo(value);
        if (property === 'audio') setIsAudio(value);

        if (userInRoom) {
            timer.current = setTimeout(() => {
                socket.emit('change video call property', { userID: cookies.get('id'), property, value });    
            },1000);
        };
    };

    const leaveVideoCall = () => {
        swal({
            title: '¿Estas seguro?',
            text: `${userInformation._id === owner.current ? `¿Quieres salir de la videollamada? ${peers.length > 0 ? 'Dejaras a tus alumnos solos.' : ''}` : '¿Quieres salir de la videollamada?'}`,
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                userVideo.current.srcObject.getTracks().forEach(track => track.stop());
                socket.emit('leave video call', { from: cookies.get('id') });
                navigate('/');
            };
        });
    };

    return exists ? 
        permission ? (
            <div className="video_call-meeting-container">
                <div className="video_call-meeting">
                    <div className="video_call-meeting-control">
                        <section className="video_call">
                            <div className="users-video_call">
                                {userInformation._id === owner.current && !isVideo && <img src={(userInformation.profilePicture === null || userInformation.profilePicture === undefined) ? "/img/noProfilePicture.png" : userInformation.profilePicture} alt="video call user" className="video_call-user-profile-image" referrerPolicy="no-referrer"/>}
                                {userInformation._id !== owner.current && peers.map(user => (user.userID === owner.current) && (
                                    <div key={user.socketID} className="users-video_call">
                                        {!user.media.video && <img src={(user.media.profilePicture === null || user.media.profilePicture === undefined) ? "/img/noProfilePicture.png" : user.media.profilePicture} alt="video call user" className="video_call-user-profile-image" referrerPolicy="no-referrer"/>}
                                        <Video peer={user.peer} className="main-user-video" hidden={user.media.video ? false : true} muted={user.media.audio ? false : true}/>
                                        <p className="username-video_call-control">{user.names.username}</p>
                                        {user.names.firstName !== '' && <p className="names-video_call-control">{user.names.firstName} {user.names.lastName}</p>}
                                    </div>
                                ))}
                                {userInformation._id === owner.current && <video playsInline muted ref={userVideo} autoPlay className="main-user-video" hidden={isVideo ? false : true}/>}
                                {userInformation._id === owner.current && <p className="username-video_call-control">{userInformation.username}</p>}
                                {userInformation._id === owner.current && userInformation.firstName !== '' && <p className="names-video_call-control">{userInformation.firstName} {userInformation.lastName}</p>}
                            </div>
                        </section>
                        <div className='students-video-zone'>
                            {userInformation._id !== owner.current && (
                                <div className="students-video">
                                    {!isVideo && <img src={(userInformation.profilePicture === null || userInformation.profilePicture === undefined) ? "/img/noProfilePicture.png" : userInformation.profilePicture} alt="video call user" className="video_call-user-profile-image-students" referrerPolicy="no-referrer"/>}
                                    <video playsInline muted ref={userVideo} autoPlay hidden={isVideo ? false : true} />
                                    <p className="username-video_call-control">{userInformation.username}</p>
                                    {userInformation.firstName !== '' && <p className="names-video_call-control">{userInformation.firstName} {userInformation.lastName}</p>}
                                </div>
                            )}
                            {peers.length > 0 
                                ? peers.map((user, index) => (user.userID !== owner.current) && (
                                        <div className="students-video" key={user.peerID}>
                                            {!user.media.video && <img src={(user.media.profilePicture === null || user.media.profilePicture === undefined) ? "/img/noProfilePicture.png" : user.media.profilePicture} alt="video call user" className="video_call-user-profile-image-students" referrerPolicy="no-referrer"/>}
                                            <Video peer={user.peer} hidden={user.media.video ? false : true} muted={user.media.audio ? false : true} />
                                            <p className="username-video_call-control">{user.names.username}</p>
                                            {userInformation._id === owner.current && (
                                                <div className="teacher-option-over-students">
                                                    {<i className={`fas fa-video ${!user.media.video && 'property-off'}`} onClick={() => user.media.video && socket.emit('change video call property', { userID: user.userID, property: 'video', value: false })} title="Desactivar video"></i>}
                                                    {<i className={`fas fa-microphone ${!user.media.audio && 'property-off'}`} onClick={() => user.media.audio && socket.emit('change video call property', { userID: user.userID, property: 'audio', value: false })} title="Desactivar audio"></i>}
                                                    {<i className="fas fa-door-open" id="remove-user-in-videocall" onClick={() => {
                                                        socket.emit('leave video call', { userID: user.userID });
                                                        const peers = peersRef.current.filter(peer => peer.userID !== user.userID);

                                                        setPeers(peers);
                                                        peersRef.current.forEach((peer,index) => (peer.userID === user.userID) && peersRef.current.splice(index,1));
                                                    }} title="Sacar usuario"></i>}
                                                </div>
                                            )}
                                            {user.names.firstName !== '' && <p className="names-video_call-control">{user.names.firstName} {user.names.lastName}</p>}
                                        </div>
                                    )) : userInformation._id === owner.current && <p className="thereAreNoAlumns">No hay alumnos conectados</p>
                            }
                        </div>
                    </div>
                </div>
                <div className="video_call-nav">
                    <div className="video_call-icons-container">
                        <div className="video-icon-container">
                            {isVideo && <i className="fas fa-video" id="fa-video" onClick={() => changeVideoCallProperty({ property: 'video', value: false })} title="Desactivar video"></i>}
                            {!isVideo && <i className="fas fa-video-slash" id="fa-video-slash" onClick={() => changeVideoCallProperty({ property: 'video', value: true })} title="Activar video"></i>}
                        </div>
                        <div className="microphone-icon-container">
                            {isAudio && <i className="fas fa-microphone" id="fa-microphone" onClick={() => changeVideoCallProperty({ property: 'audio', value: false })} title="Desactivar audio"></i>}
                            {!isAudio && <i className="fas fa-microphone-slash" id="fa-microphone-slash" onClick={() => changeVideoCallProperty({ property: 'audio', value: true })} title="Activar audio"></i>}
                        </div>
                        {/*<i className="fas fa-exclamation-triangle" id="fa-exclamation-triangle" title="Reportar"></i>*/}
                        <i className="fas fa-phone" id="fa-phone" title="Salir" onClick={() => leaveVideoCall()}></i>
                    </div>
                </div>
                {areThereCalls && calls.current.map((call,index) => (index === 0) && (
                        <div key={index} className="video_call-notification">
                            <img src={(call.profilePicture === null || call.profilePicture === undefined) ? "/img/noProfilePicture.png" : call.profilePicture} className="call_video-notification-image" alt="call notification"/>
                            <div>
                                <h2 className="call_video-notification-name">{call.name}</h2>
                                <div className="call_video-notification-button-container">
                                    <button className="accept-call" onClick={() => buttonValidation({ isAccepted: true, id: call.from })}>Aceptar</button> 
                                    <button className="remove-call" onClick={() => buttonValidation({ isAccepted: false, id: call.from })}>Remover</button>
                                </div>
                            </div>
                        </div>
                        )
                    )}
            </div>
        ) : (
            <div className="ask-camera-permission-container">
                <div className="ask-camera-permission">
                    <h1>PERMISOS</h1>
                    <p>Penssum necesita acceder a tu cámara y a tu micrófono para que los otros participantes te vean y te oigan. Tendrás que confirmar esta decisión en cada navegador y ordenador que utilices, tus datos estan seguro con nosotros.</p>
                    <button onClick={() => setPermission(true)}>Ok</button>
                </div>
            </div>
        ) : <div style={{ paddingTop: '40px' }}><Loading margin="auto" /></div>;;
};

export default VideoCall;