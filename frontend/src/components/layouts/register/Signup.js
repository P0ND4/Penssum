import { useState, } from "react";
import { useNavigate } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GoogleLogin from 'react-google-login';
import { createUser } from '../../../api';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Signup({ setUserInformation, registrationProcess, setRegistrationProcess }) {
    const [field,setField] = useState({
        firstName: true,
        lastName: true,
        username: false,
        email: false,
        password: false,
        repeatPassword: false,
    });

    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        repeatPassword: ''
    });
    const [sendingInformation,setSendingInformation] = useState(false);

    const navigate = useNavigate();
    
    const responseFacebook = async (response) => {
        const username = response.name+'_'+response.email.slice(0,5)+`-${response.userID.charAt(response.userID.length - 1)}`;

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

        if (result.error) {
            const error = document.querySelector('.register_error');
            error.textContent = 'El usuario ya esta registrado, por favor inicie sesion.';
            error.classList.add('showError');
        } else { 
            setRegistrationProcess({ ...registrationProcess, selection: false });
            setUserInformation(result);
            navigate('/signup/selection'); 
        };
    };

    const responseGoogle = async (response) => {
        const user = response.profileObj;
        const username = user.givenName+user.givenName.slice(0,2)+'_'+user.email.slice(0,5)+`-${user.googleId.charAt(user.googleId.length - 1)}`;

        const data = {
            firstName: user.givenName,
            lastName:  user.familyName,
            username: username.replace(/ /g, ""),
            email: user.email,
            password: user.googleId,
            profilePicture: user.imageUrl,
            registered: 'google'
        };

        setSendingInformation(true);
        const result = await createUser(data);
        setSendingInformation(false);

        if (result.error) {
            const error = document.querySelector('.register_error');
            error.textContent = 'El usuario ya esta registrado, por favor inicie sesion.';
            error.classList.add('showError');
        } else {
            setRegistrationProcess({ ...registrationProcess, selection: false });
            cookies.set('id', result._id, { path: '/' });
            setUserInformation(result);
            navigate('/signup/selection'); 
        };
    };

    const signUpFormValidation = {
        textLimit: /^[a-zA-Za]{0,16}$/,
        username: /^[a-zA-Z0-9_.+-]{3,16}$/,
        email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/,
        password: /^.{6,30}$/
    };

    const validateField = (expression, input) => {
        if (expression.test(input.value)) { 
            document.querySelector(`.field_${input.name}`).classList.remove('showError'); 
            setField({ 
                ...field,
                [input.name]: true 
            }); 
        }
        else {
            (input.value === '')
                ? document.querySelector(`.field_${input.name}`).classList.remove('showError')
                : document.querySelector(`.field_${input.name}`).classList.add('showError'); 
            setField({ 
                ...field,
                [input.name]: false 
            });
        };
    };

    const passwordValidation = () => {
        const password = document.getElementById('password');
        const repeatPassword = document.getElementById('repeatPassword');
        if (password.value !== repeatPassword.value) { 
            document.querySelector('.field_repeatPassword').classList.add('showError');
            if (repeatPassword.value === '') document.querySelector('.field_repeatPassword').classList.remove('showError');
            setField({
                ...field,
                repeatPassword: false 
            });
        }
        else { 
            document.querySelector('.field_repeatPassword').classList.remove('showError');
            setField({
                ...field,
                repeatPassword: true 
            });
        };
    };

    const changeEvent = e => {
        document.querySelector(".field_fill_in_fields").classList.remove('showError');
        document.querySelector('.field_error_username').classList.remove('showError')
        document.querySelector('.field_error_email').classList.remove('showError');
        const error = document.querySelector('.register_error');
        error.classList.remove('showError');

        setData({
            ...data,
            [e.target.name]: e.target.value
        });

        const targetName = e.target.name;
        const input = e.target;

        if (targetName === "firstname") { validateField(signUpFormValidation.textLimit, input) };
        if (targetName === "lastname") { validateField(signUpFormValidation.textLimit, input) };
        if (targetName === "username") { validateField(signUpFormValidation.username, input) };
        if (targetName === "email") { validateField(signUpFormValidation.email, input) };
        if (targetName === "password") { validateField(signUpFormValidation.password, input) };
        if (targetName === "repeatPassword") { passwordValidation() };
    };

    const validation = async () => {
        setSendingInformation(true);
        if (field.firstName && field.lastName && field.username && field.email && field.password && field.repeatPassword) {            
            const result = await createUser(data);
            if (result.error) {
                setTimeout(() => {
                    setSendingInformation(false);
                    if (result.type.user) document.querySelector('.field_error_username').classList.add('showError');
                    if (result.type.email) document.querySelector('.field_error_email').classList.add('showError');
                    return;
                },1200);
            } else {
                setRegistrationProcess({ ...registrationProcess, selection: false });
                cookies.set('id', result._id, { path: '/' });
                setUserInformation(result);
                navigate('/signup/selection');
            };
        } else { 
            setTimeout(() => {
                setSendingInformation(false);
                document.querySelector(".field_fill_in_fields").classList.add('showError');
            },800);
        };
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-card-title">
                    <h1>Registrate</h1>
                </div>
                <form onSubmit={e => e.preventDefault()} id="main-form-register">
                    <p className="field register_error" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}></p>
                    <div className="form-grid">
                        <div className="form-control">
                            <input type="text" placeholder="Nombre (opcional)" name="firstname" onKeyUp={changeEvent} />
                            <p className="field field_firstname">El nombre no puede superar los 16 caracteres tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="Apellido (opcional)" name="lastname" onKeyUp={changeEvent} />
                            <p className="field field_lastname">El apellido no puede superar los 16 caracteres tener numeros o contener simbolos extraños.</p>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="Nombre de usuario" name="username" onKeyUp={changeEvent} />
                            <p className="field field_username">El nombre de usuario no puede superar los 16 caracteres y no puede ser menor a 3 caracteres ni colocar simbolos extraños.</p>
                            <p className="field field_error_username">El nombre de usuario ya existe.</p>
                        </div>
                        <div className="form-control">
                            <input type="email" placeholder="Correo electronico" name="email" onKeyUp={changeEvent} />
                            <p className="field field_email">Correo invalido.</p>
                            <p className="field field_error_email">El correo esta en uso.</p>
                        </div>
                        <div className="form-control">
                            <input type="password" placeholder="Contraseña" id="password" name="password" onKeyUp={changeEvent} />
                            <p className="field field_password">La contraseña no debe tener menos de 6 caracteres ni superar los 30 caracteres.</p>
                        </div>
                        <div className="form-control">
                            <input type="password" placeholder="Repite la contraseña" id="repeatPassword" name="repeatPassword" onKeyUp={changeEvent} />
                            <p className="field field_repeatPassword">La contraseña deben ser iguales.</p>
                        </div>
                    </div>
                    <p className="field field_fill_in_fields" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>Rellene los campos.</p>
                    <div className="form-control">
                        <button 
                            id="signup-button" 
                            style={{ 
                                background: sendingInformation ? '#3282B8' : '', 
                                opacity: sendingInformation ? '.4' : '', 
                                cursor: sendingInformation ? 'not-allowed' : '' 
                            }} 
                            onClick={() => { if (!sendingInformation) validation() }}
                        >REGISTRARSE</button>
                    </div>
                    <div className="form-control">
                        <h2 className="signUpUsingTitle">O registrate usando...</h2>
                        <div className="registration-options">
                            <FacebookLogin
                                appId={process.env.REACT_APP_FACEBOOK_ID}
                                autoLoad={false}
                                fields="name,email,picture"
                                callback={responseFacebook} 
                                render={renderProps => (
                                    <button id="signup-wity-facebook" onClick={renderProps.onClick}><img src="/img/icon/facebook_icon.svg" alt="facebook" className="facebook_icon" /> FACEBOOK</button>
                                )}/>
                            <GoogleLogin
                                clientId={process.env.REACT_APP_GOOGLE_ID}
                                render={renderProps => (
                                    <button id="signup-wity-google" onClick={renderProps.onClick} disabled={renderProps.disabled}><img src="/img/icon/google_icon.svg" alt="google" className="google_icon" /> GOOGLE</button>
                                )}
                                onSuccess={responseGoogle}
                                onFailure={() => console.log('There is an error starting Google')}
                                cookiePolicy={'single_host_origin'}
                                />
                        </div>
                    </div>
                </form>
            </div>
            <div className="container-description-signup">
                <div className="description-signup">
                    <h1>Registrate !YA!</h1>
                    <p>
                        Al registrarte aceptas los terminos y condiciones del uso
                        apropiado de la aplicacion llevando la responsabilidad y
                        el uso adecuado, lea con atencion las
                        siguientes caracteristicas, una vez registrada la cuenta
                        podra hacer uso de las siguientes funcionalidades:
                        <ul>
                            <li>Tener perfil personalizable</li>
                            <li>Podra comprar productos</li>
                            <li>Podra publicar productos</li>
                            <li>Podra tener acceso a videollamadas</li>
                        </ul><br />
                        Estas son algunas reglas que debe cumplir:
                        <ul>
                            <li>No esta permitido indicio de pornografia, juguetes sexuales, u otros</li>
                            <li>Impuntualidad a la presentacion por videollamada</li>
                            <li>No esta permitido las malas palabras, discriminacion, racismo, incitar al odio, palabras de doble sentido u otro en publicaciones</li>
                        </ul><br />
                        Algun incumplimiento de estas reglas pueden llevar a cabo las siguientes penalizaciones:
                        <ul>
                            <li>La advertencia por medio de la aplicacion</li>
                            <li>La suspencion temporal</li>
                            <li>El bloqueo permanente</li>
                        </ul><br />

                        Por favor siga las reglas con prudencia.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
