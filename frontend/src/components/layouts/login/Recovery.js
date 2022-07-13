import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, recoveryPassword, changePassword, socket } from '../../../api';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Recovery ({ setUserInformation, setAuth }){
	const [sendingInformation,setSendingInformation] = useState(false);
	const [foundUserInformation,setFoundUserInformation] = useState(null);
	const [section,setSection] = useState('email');
	const [email,setEmail] = useState('');
	const [code,setCode] = useState('');
	const [inputCode,setInputCode] = useState('');
	const [errorCount,setErrorCount] = useState(0);

	const [newPassword,setNewPassword] = useState('');
	const [repeatPassword,setRepeatPassword] = useState('');

	const navigate = useNavigate();

	const verifyEmail = async () => {
		const errorHandler = document.querySelector('.recovery-error');

		if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(email)) {
			setSendingInformation(true);
			const result = await getUser({ email });
			
			if (result.error) {
				setSendingInformation(false);
				errorHandler.textContent = 'El usuario no existe.';
				errorHandler.classList.add('showError');
			} else {
				setFoundUserInformation(result);
				const emailResult = await recoveryPassword({ userInformation: result });
				setSendingInformation(false);
				setCode(emailResult.code);
				setSection('check');
			};
		} else {
			errorHandler.textContent = 'Correo invalido.';
			errorHandler.classList.add('showError');
		};
	};

	const verifyCode = () => {
		const errorHandler = document.querySelector('.recovery-error-code');
		setSendingInformation(true);

		if (inputCode === code) {
			setSendingInformation(false);
			setSection('password');
		} else {
			setErrorCount(errorCount + 1);
			if (errorCount === 5) {
				swal({
                    title: 'Error',
                    text: 'Maximo de intento superado.',
                    icon: 'error',
                    timer: '3000',
                    button: false,
                }).then(() => navigate('/signin'));
			} else errorHandler.classList.add('showError'); 
		};

		setTimeout(() => setSendingInformation(false),400);
	};

	const passwordEvent = async () => {
		const errorHandler = document.querySelector('.recovery-error-password');

		if (newPassword !== repeatPassword) {
			errorHandler.textContent = 'Las contraseñas no son iguales.';
			errorHandler.classList.add('showError');
			return
		};

		if (/^.{6,30}$/.test(newPassword)) {
			setSendingInformation(true);
			const user = await changePassword({ 
				id: foundUserInformation._id, 
				password: code, 
				newPassword, 
				isForgot: true 
			});
			setUserInformation(user);
			setSendingInformation(false);

			swal({
                title: '!EXITO!',
                text: 'Contraseña cambiada con !EXITO!',
                icon: 'success',
                timer: '3000',
                button: false,
            }).then(() => {
            	cookies.set('id', user._id, { path: '/' });
	            socket.emit('connected', user._id);
	            setAuth(true);
	            navigate('/');
            });
		} else {
			errorHandler.textContent = 'Las contraseñas debe tener un minimo de 6 caracteres y un maximo de 30 caracteres.';
			errorHandler.classList.add('showError');
		};
	};

	return (
		<div className="recovery-container">
			{section === 'email' && (
				<div className="recovery">
					<h3>Recupera tu cuenta</h3>
					<div className="account-recovery-description">
						<p className="field recovery-error" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', fontSize: '16px' }}></p>
						<p>Introduce tu correo electrónico para buscar tu cuenta.</p>
						<div className="form-control recovery-input-form">
							<input type="email" value={email} placeholder="Correo electronico" onChange={e => {
								document.querySelector('.recovery-error').classList.remove('showError');
								document.querySelector('.recovery-error').textContent = '';
								setEmail(e.target.value.trim());
							}}/>
						</div>
					</div>
					<div className="account-recovery-button-container">
						<Link to="/signin" style={{ textDecoration: 'none' }}><button id="cancel-recovery">Cancelar</button></Link>
						<button 
							id="accept-recovery"
							style={{ 
                                background: sendingInformation ? '#3282B8' : '', 
                                opacity: sendingInformation ? '.4' : '', 
                                cursor: sendingInformation ? 'not-allowed' : '' 
                            }}
							onClick={() => { if (!sendingInformation) verifyEmail()}}>Buscar</button>
					</div>
				</div>
			)}
			{section === 'check' && (
				<div className="recovery">
					<h3>Ingresa el código de seguridad</h3>
					<div className="account-recovery-description">
						<p className="field recovery-error-code" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', fontSize: '16px' }}>Codigo incorrecto.</p>
						<p>Comprueba si recibiste un correo electrónico con tu código de 6 dígitos.</p>
						<div className="form-control recovery-input-code-form">
							<input type="number" value={inputCode} placeholder="Codigo" onChange={e => {
								document.querySelector('.recovery-error-code').classList.remove('showError');
								setInputCode(e.target.value.trim());
							}}/>
							<p>Enviamos el código a: <br/> {email}</p>
						</div>
					</div>
					<div className="account-recovery-code-button-container">
						<p onClick={() => setSection('email')}>¿No recibiste el correo?</p>
						<div className="account-recovery-code-button">
							<Link to="/signin" style={{ textDecoration: 'none' }}><button id="cancel-recovery">Cancelar</button></Link>
							<button 
								id="verify-code"
								style={{ 
	                                background: sendingInformation ? '#3282B8' : '', 
	                                opacity: sendingInformation ? '.4' : '', 
	                                cursor: sendingInformation ? 'not-allowed' : '' 
	                            }}
								onClick={() => { if (!sendingInformation) verifyCode()}}>Continuar</button>
						</div>
					</div>
				</div>
			)}
			{section === 'password' && (
				<div className="recovery">
					<h3>Crea una nueva contraseña</h3>
					<div className="account-recovery-description">
						<p className="field recovery-error-password" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', fontSize: '16px' }}></p>
						<p>Introduce una nueva contraseña segura para tu cuenta.</p>
						<div className="form-control recovery-input-form">
							<input type="password" value={newPassword} placeholder="Nueva contraseña" onChange={e => {
								document.querySelector('.recovery-error-password').classList.remove('showError');
								document.querySelector('.recovery-error-password').textContent = '';
								setNewPassword(e.target.value);
							}}/>
						</div>
						<div className="form-control recovery-input-form">
							<input type="password" value={repeatPassword} placeholder="Repite la contraseña" onChange={e => {
								document.querySelector('.recovery-error-password').classList.remove('showError');
								document.querySelector('.recovery-error-password').textContent = '';
								setRepeatPassword(e.target.value);
							}}/>
						</div>
					</div>
					<div className="account-recovery-button-container">
						<Link to="/signin" style={{ textDecoration: 'none' }}><button id="cancel-recovery">Cancelar</button></Link>
						<button 
							id="accept-recovery"
							style={{ 
                                background: sendingInformation ? '#3282B8' : '', 
                                opacity: sendingInformation ? '.4' : '', 
                                cursor: sendingInformation ? 'not-allowed' : '' 
                            }}
							onClick={() => { if (!sendingInformation) passwordEvent()}}>Continuar</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Recovery