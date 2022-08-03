import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, checkAdminInformation, socket, createUser } from '../../../api';
import jwt_decode from 'jwt-decode';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Signin({ setAuth, setUserInformation, setSigninAdmin, setRegistrationProcess, registrationProcess }) {
    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const [sendingInformation,setSendingInformation] = useState(false);
    const [errorGoogle,setErrorGoogle] = useState(false);

    const navigate = useNavigate();
    const buttonGoogle = useRef();

    const responseFacebook = async (response) => {
        const data = {
            email: response.email,
            password: response.userID,
        };

        setSendingInformation(true);
        const result = await loginUser(data);
        setSendingInformation(false);

        if (result.error) {
            if (result.type === 'Invalid password') return document.querySelector('.login_error').classList.add('showError')
            else {
                const username = response.name.slice(0,2)+response.email.slice(0,2)+`${response.userID.charAt(response.userID.length - 1)}${Math.round(Math.random() * 1000)}`;

                const data = {
                    username: username.replace(/ /g, ""),
                    email: response.email,
                    password: response.userID,
                    profilePicture: response.picture.data.url,
                    registered: 'facebook'
                };

                setSendingInformation(true);
                const result = await createUser(data);
                setSendingInformation(false);
                
                setRegistrationProcess({ ...registrationProcess, selection: false });
                setUserInformation(result);
                navigate('/signup/selection'); 
            };
        } else {
            if (result.objetive === '') navigate('/signup/selection')
            else {
                cookies.set('id', result._id, { path: '/' });
                setUserInformation(result);
                setAuth(true);
                socket.emit('connected', result._id);
                navigate('/');
            }
        };
    };

    const responseGoogle = useCallback(
        async (response) => {
            const user = jwt_decode(response.credential);

            const data = {
                email: user.email,
                password: user.sub,
            };

            setSendingInformation(true);
            const result = await loginUser(data);
            setSendingInformation(false);

            if (result.error) {
                if (result.type === 'Invalid password') return document.querySelector('.login_error').classList.add('showError')
                else {
                    const username = user.given_name.slice(0,2)+user.email.slice(0,2)+`${user.sub.charAt(user.sub.length - 1)}${Math.round(Math.random() * 1000)}`;

                    const data = {
                        firstName: user.given_name,
                        lastName:  user.family_name,
                        username: username.replace(/ /g, ""),
                        email: user.email,
                        password: user.sub,
                        profilePicture: user.picture,
                        registered: 'google'
                    };

                    setSendingInformation(true);
                    const result = await createUser(data);
                    setSendingInformation(false);

                    
                    setRegistrationProcess({ ...registrationProcess, selection: false });
                    cookies.set('id', result._id, { path: '/' });
                    setUserInformation(result);
                    navigate('/signup/selection'); 
                };
            } else {
                if (result.objetive === '') navigate('/signup/selection')
                else {
                    cookies.set('id', result._id, { path: '/' });
                    setUserInformation(result);
                    setAuth(true);
                    socket.emit('connected', result._id);
                    navigate('/');
                };
            };
        },[navigate,setAuth,setUserInformation,registrationProcess,setRegistrationProcess]
    );

    useEffect(() => {
        const google = document.getElementById('google-handler');

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_ID,
                callback: responseGoogle
            });
            window.google.accounts.id.renderButton(buttonGoogle.current,{
                theme: 'outline',
                text: 'signin'
            });
        };

        google.addEventListener('load', () => setErrorGoogle(true));

        return (() => setErrorGoogle(false));
    },[responseGoogle,errorGoogle]);

    const changeData = e => {
        document.querySelector('.login_error').classList.remove('showError');
        document.querySelector('.login_error_registered').classList.remove('showError');

        setData({
            ...data,
            [e.target.name]: e.target.name === 'password' ? e.target.value : e.target.value.trim()
        });
    };

    const verification = async () => {
        setSendingInformation(true);
        const checkInformation = await checkAdminInformation({ security: 1, data });

        if (!checkInformation.error) {
            setSigninAdmin(true);
            return navigate('/signin/admin');
        };

        const result = await loginUser(data);

        if (result.error) {
            setTimeout(() => {
                setSendingInformation(false);
                return document.querySelector('.login_error').classList.add('showError');
            },800);
        } else {
            setUserInformation(result);
            if (result.objetive === '') { navigate('/signup/selection') }
            else if (result.validated) {
                cookies.set('id', result._id, { path: '/' });
                setAuth(true);
                socket.emit('connected', result._id);
                navigate('/');
            } else { navigate('/signup/check/email') };
        };
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-card-title">
                    <h1>Inicia sesion</h1>
                </div>
                <form onSubmit={e => e.preventDefault()}>
                    <p className="field login_error_registered" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>Usuario no registrado</p>
                    <p className="field login_error" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>Correo o contraseña invalida</p>
                    <div className="form-container">
                        <div className="form-control">
                            <input type="text" placeholder="Correo" name="email" onChange={changeData} />
                        </div>
                        <div className="form-control">
                            <input type="password" placeholder="Contraseña" name="password" onChange={changeData} />
                        </div>
                    </div>
                    <div className="form-control">
                        <button 
                            id="signin-button" 
                            style={{ 
                                background: sendingInformation ? '#3282B8' : '', 
                                opacity: sendingInformation ? '.4' : '', 
                                cursor: sendingInformation ? 'not-allowed' : '' 
                            }} 
                            onClick={() => { if (!sendingInformation)  verification() }}
                        >Ingresar</button>
                    </div>
                    <div className="form-control you-forgot-the-password">
                        <Link to="/signin/recovery" id="you-forgot-the-password">¿Olvidaste tu contraseña?</Link>
                    </div>
                    <div className="form-control">
                        <h2 className="signInUsingTitle">O inicia sesion usando...</h2>
                        <div className="registration-options">
                            <FacebookLogin
                                appId={process.env.REACT_APP_FACEBOOK_ID}
                                autoLoad={false}
                                fields="name,email,picture"
                                callback={responseFacebook}
                                disableMobileRedirect={true}
                                render={renderProps => (
                                    <button id="signup-with-facebook" onClick={renderProps.onClick}><img src="/img/icon/facebook_icon.svg" alt="facebook" className="facebook_icon" />FACEBOOK</button>
                                )} />
                            <div className="google-zone-form">
                                <div ref={buttonGoogle}></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div className="illustration-signin-container">
                <img src="./img/illustration/login.svg" alt="illustration-svg-signin" />
            </div>
        </div>
    );
};

export default Signin;
