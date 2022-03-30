import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../../api';
import Peer from 'simple-peer';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function VideoCall() {
    const [stream, setStream] = useState(null);
    const [usersVideo, setUsersVideo] = useState([]);
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded/*, setCallEnded*/] = useState(false);
    const [name/*, setName*/] = useState('');

    const myVideo = useRef();
    const connectionRef = useRef();

    const { meeting_id } = useParams();

    useEffect(() => {
        socket.emit('join-room', meeting_id);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                myVideo.current.srcObject = currentStream;
            }).catch(error => console.log(error));

        socket.on('calluser', ({ signal, from, name: callerName }) => {
            setCall({ isReceivedCall: true, from, callerName, signal });
        });
    }, [meeting_id]);

    const callUser = useCallback(
        videoCallInformation => {
            const peer = new Peer({ initiator: true, trickle: false, stream });

            peer.on('signal', (data) => {
                socket.emit('calluser', { userToCall: videoCallInformation.owner, signalData: data, from: videoCallInformation.currentUser, name });
            });

            peer.on('stream', (currentStream) => {
                setUsersVideo(prev => [...prev, currentStream]);
            });

            socket.on('callaccepted', (signal) => {
                setCallAccepted(true);

                peer.signal(signal);
            });

            connectionRef.current = peer;
        }, [stream, name]
    );

    useEffect(() => {
        if (cookies.get('id') !== '6213b812166a357c47eb69d5') {
            socket.emit('video_call_information', '6213b812166a357c47eb69d5');
        };

        socket.on('video_call_information', videoCallInformation => callUser(videoCallInformation));
    }, [stream, callUser]);

    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answercall', { signal: data/*, to: call.from*/ });
        });

        peer.on('stream', (currentStream) => {
            setUsersVideo(prev => [...prev, currentStream]);
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    };

    /*const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy();

        window.location.reload();
    };*/


    const changeIcon = (mainElementById, secondElementById) => {
        document.getElementById(mainElementById).style.display = 'none';
        document.getElementById(secondElementById).style.display = 'block';
    }

    return (
        <div className="video_call-meeting-container">
            <div className="video_call-meeting">
                <div className="video_call-meeting-control">
                    <section className="video_call">
                        <div className="users-video_call">
                            {stream && (<video playsInline muted ref={myVideo} autoPlay className="main-user-video" />)}
                        </div>
                    </section>
                    <div className='students-video-zone'>
                        {usersVideo.length > 0
                            ? usersVideo.map(userVideo => {
                                return callAccepted && !callEnded && (
                                    <div className='students-video hola'>
                                        <video ref={video => { video.srcObject = userVideo }} playsInline muted autoPlay />
                                    </div>
                                );
                            }) : <></>
                        }
                    </div>
                </div>
            </div>
            <div className="video_call-nav">
                <div className="video_call-icons-container">
                    <div className="video-icon-container">
                        <i className="fas fa-video" id="fa-video" onClick={() => changeIcon('fa-video', 'fa-video-slash')}></i>
                        <i className="fas fa-video-slash" id="fa-video-slash" onClick={() => changeIcon('fa-video-slash', 'fa-video')}></i>
                    </div>
                    <div className="microphone-icon-container">
                        <i className="fas fa-microphone" id="fa-microphone" onClick={() => changeIcon('fa-microphone', 'fa-microphone-slash')}></i>
                        <i className="fas fa-microphone-slash" id="fa-microphone-slash" onClick={() => changeIcon('fa-microphone-slash', 'fa-microphone')}></i>
                    </div>
                    <i className="fas fa-exclamation-triangle" id="fa-exclamation-triangle"></i>
                    <i className="fas fa-phone" id="fa-phone"></i>
                </div>
            </div>
            {call.isReceivedCall && !callAccepted && (<button onClick={() => answerCall()}>Si</button>)}
        </div>
    );
};

export default VideoCall;