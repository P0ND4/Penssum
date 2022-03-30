import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, checkAdminInformation } from '../../api';

import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GoogleLogin from 'react-google-login';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Signin({ setAuth, setUserInformation, setSigninAdmin }) {
    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const responseFacebook = async (response) => {
        const data = {
            email: response.email,
            password: response.userID,
        };

        const result = await loginUser(data);

        if (result.error) {
            return document.querySelector('.login_error_registered').classList.add('showError');
        } else {
            if (result.objetive === '') navigate('/signup/selection')
            else {
                cookies.set('id', result._id, { path: '/' });
                setUserInformation(result);
                setAuth(true);
                navigate('/');
            }
        };
    };

    const responseGoogle = async (response) => {
        const user = response.profileObj;

        const data = {
            email: user.email,
            password: user.googleId,
        };

        const result = await loginUser(data);

        if (result.error) {
            return document.querySelector('.login_error_registered').classList.add('showError');
        } else {
            if (result.objetive === '') navigate('/signup/selection')
            else {
                cookies.set('id', result._id, { path: '/' });
                setUserInformation(result);
                setAuth(true);
                navigate('/');
            }
        };
    };

    const changeData = e => {
        document.querySelector('.login_error').classList.remove('showError');
        document.querySelector('.login_error_registered').classList.remove('showError');

        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    };

    const verification = async () => {
        const checkInformation = await checkAdminInformation({ security: 1, data });

        if (!checkInformation.error) {
            setSigninAdmin(true);
            return navigate('/signin/admin');
        };

        const result = await loginUser(data);

        if (result.error) return document.querySelector('.login_error').classList.add('showError')
        else {
            setUserInformation(result);
            if (result.objetive === '') { navigate('/signup/selection') }
            else if (result.validated) {
                cookies.set('id', result._id, { path: '/' });
                setAuth(true);
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
                        <button id="signin-button" onClick={() => verification()}>Ingresar</button>
                    </div>
                    <div className="form-control">
                        <h2 className="signInUsingTitle">O inicia sesion usando...</h2>
                        <div className="registration-options">
                            <FacebookLogin
                                appId="374024097393013"
                                autoLoad={false}
                                fields="name,email,picture"
                                callback={responseFacebook}
                                render={renderProps => (
                                    <button id="signup-wity-facebook" onClick={renderProps.onClick}><img src="./img/icon/facebook_icon.svg" alt="facebook" className="facebook_icon" />FACEBOOK</button>
                                )} />
                            <GoogleLogin
                                clientId="272273763715-ssk2gsrtevrj8sj9g9ou8calc1umcsd1.apps.googleusercontent.com"
                                render={renderProps => (
                                    <button id="signup-wity-google" onClick={renderProps.onClick} disabled={renderProps.disabled}><img src="./img/icon/google_icon.svg" alt="google" className="google_icon" />GOOGLE</button>
                                )}
                                onSuccess={responseGoogle}
                                onFailure={() => document.querySelector('.login_error').classList.add('showError')}
                                cookiePolicy={'single_host_origin'}
                            />
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
