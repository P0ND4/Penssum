import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { changePreferenceValue } from "../../../api";
import { useParams } from 'react-router';

import PreferencePart from '../../parts/user/PreferencePart';
import SecurityPreference from '../../parts/user/SecurityPreference';
import PreferenceToggle from '../../parts/user/PreferenceToggle';
import swal from 'sweetalert'

import Cookies from "universal-cookie";

const cookies = new Cookies();

function Preference({ userInformation, setUserInformation }) {
    const { attribute } = useParams();
    const [bankData,setBankData] = useState({
        bank: userInformation.bankData.bank,
        accountNumber: userInformation.bankData.accountNumber,
        accountType: userInformation.bankData.accountType
    });

    const descriptionTimer = useRef(null);

    const changeDescription = (e, id) => {
        document.getElementById(id).textContent = `${e.target.value.length}/200`;

        if (descriptionTimer !== null) clearTimeout(descriptionTimer.current);

        descriptionTimer.current = setTimeout(async () => {
            const valueToChange = {
                id: cookies.get('id'),
                name: 'description',
                value: e.target.value
            };
    
            const result = await changePreferenceValue(valueToChange);
    
            setUserInformation(result);

            descriptionTimer.current = null
        },2000);
    };

    useEffect(() => {
        if (attribute === 'mod=general') {
            document.getElementById('first-name-input').value = userInformation.firstName;
            document.getElementById('second-name-input').value = userInformation.secondName;
            document.getElementById('last-name-input').value = userInformation.lastName;
            document.getElementById('second-surname-input').value = userInformation.secondSurname;
            document.getElementById('preference-description-input').value = userInformation.description;
        };

        if (attribute === 'mod=profile_information') {
            document.getElementById('CI-input').value = userInformation.identification;
            document.getElementById('years-experience-input').value = userInformation.yearsOfExperience;
            document.getElementById('phone-number-input').value = userInformation.phoneNumber;
        };
    }, [userInformation, attribute]);

    const changeInformation = async (name, information) => {
        document.getElementById("CI").style.display = 'none';
        document.getElementById("city").style.display = 'none';
        document.querySelector('body').style.overflow = 'auto';

        const valueToChange = {
            id: cookies.get('id'),
            name: name,
            value: information
        };

        const result = await changePreferenceValue(valueToChange);

        setUserInformation(result);
    };

    useEffect(() => {
        document.querySelectorAll('.preference-sections').forEach(section => section.classList.remove('preference-active'));
        if (window.screen.width <= 600) document.querySelector('.preference-sections-container').classList.add('preference-sections-container-in-mobile');
        else document.querySelector('.preference-sections-container').classList.remove('preference-sections-container-in-mobile');

        if (attribute === 'mod=general') document.querySelector('.general-link').classList.add('preference-active');
        if (attribute === 'mod=security') document.querySelector('.security-link').classList.add('preference-active');
        if (attribute === 'mod=profile_information') document.querySelector('.profile-information-link').classList.add('preference-active');
        if (attribute === 'mod=privacy') document.querySelector('.privacy-link').classList.add('preference-active');
        if (attribute === 'mod=payment') document.querySelector('.payment-link').classList.add('preference-active');
    });

    const changeAvailability = () => {
        const days = userInformation.availability;
        if (days.monday && days.tuesday && days.wednesday && days.thursday && days.friday && days.saturday && days.sunday) {
            return 'Todos los dias';
        } else if (!days.monday && !days.tuesday && !days.wednesday && !days.thursday && !days.friday && !days.saturday && !days.sunday) {
            return 'Ningun dia';
        } else {
            return `
                ${(days.monday) ? 'Lunes' : ''} 
                ${(days.tuesday) ? 'Martes' : ''} 
                ${(days.wednesday) ? 'Miercoles' : ''} 
                ${(days.thursday) ? 'Jueves' : ''} 
                ${(days.friday) ? 'Viernes' : ''} 
                ${(days.saturday) ? 'Sabado' : ''} 
                ${(days.sunday) ? 'Domingo' : ''}
            `;
        };
    };

    const bankDataValueChange = async () => {
        const error = document.querySelector('.field_value-error-handler');
        error.classList.remove('showError');
        
        if (/^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{0,80}$/.test(bankData.bank) &&
            /^[0-9]{0,50}$/.test(bankData.accountNumber)) {
            await changePreferenceValue({ id: cookies.get('id'), name: 'bankData', value: bankData });
        
            swal({
                title: 'Datos actualizados',
                text: 'Los datos han sido actualizados correctamente.',
                icon: 'success',
                timer: '2000',
                button: false,
            });

            setUserInformation({
                ...userInformation,
                bankData
            })
        } else error.classList.add('showError');
    };

    return (
        <div className="preference-container">
            <div className="preference">
                <div className="preference-sections-container">
                    <h1 className="preference-sections-title">Configuraciones</h1>
                    <hr />
                    <Link to="/preference/mod=general" className="preference-sections general-link">
                        <i className="fas fa-cog"></i>
                        <p>General</p>
                    </Link>
                    <Link to="/preference/mod=security" className="preference-sections security-link">
                        <i className="fas fa-shield-alt"></i>
                        <p>Seguridad</p>
                    </Link>
                    <Link to="/preference/mod=profile_information" className="preference-sections profile-information-link">
                        <i className="fas fa-th"></i>
                        <p>Informacion de perfil</p>
                    </Link>
                    <hr />
                    <Link to="/preference/mod=payment" className="preference-sections payment-link">
                        <i className="fa-solid fa-money-bills"></i>
                        <p>Pago</p>
                    </Link>
                    <Link to="/preference/mod=privacy" className="preference-sections privacy-link">
                        <i className="fas fa-user-lock"></i>
                        <p>Privacidad</p>
                    </Link>
                </div>
                <div className="main-preference-section">
                    <i className="fas fa-chevron-left" id="fa-chevron-left-preference" onClick={() => document.querySelector('.preference-sections-container').classList.remove('preference-sections-container-in-mobile')}></i>
                    {attribute === 'mod=general'
                        ? <div className="commomStylePadding general">
                            <PreferencePart property="Primer Nombre" value={userInformation.firstName === '' ? 'No definido' : userInformation.firstName} id="edit-first-name" inputType="text" placeholder="Ejemplo: Jose" idInput="first-name-input" name="firstName" setUserInformation={setUserInformation} />
                            <PreferencePart property="Segundo Nombre" value={userInformation.secondName === '' ? 'No definido' : userInformation.secondName} id="edit-second-name" inputType="text" placeholder="Ejemplo: Samuel" idInput="second-name-input" name="secondName" setUserInformation={setUserInformation} />
                            <PreferencePart property="Primer Apellido" value={userInformation.lastName === '' ? 'No definido' : userInformation.lastName} id="edit-last-name" inputType="text" placeholder="Ejemplo: Mendez" idInput="last-name-input" name="lastName" setUserInformation={setUserInformation} />
                            <PreferencePart property="Segundo Apellido" value={userInformation.secondSurname === '' ? 'No definido' : userInformation.secondSurname} id="edit-second-surname" inputType="text" placeholder="Ejemplo: Perez" idInput="second-surname-input" name="secondSurname" setUserInformation={setUserInformation} />
                            <div className="preference-description-container">
                                <div className="preference-description-zone">
                                    <textarea className="preference-description" maxLength={200} placeholder="Has una breve descripcion sobre ti" id="preference-description-input" onChange={e => changeDescription(e, 'letter-count-description-preference')}></textarea>
                                    <span id="letter-count-description-preference">0/200</span>
                                </div>
                            </div>
                        </div>
                        : attribute === 'mod=security'
                            ? <div className="commomStylePadding security">
                                <div className="login-security-container">
                                    <h1>Inicio de seccion</h1>
                                    <hr />
                                    <div className="login-security-zone">
                                        <SecurityPreference property="Cambiar contraseña" i="fab fa-keycdn" description="Elige una contraseña segura que solo tu sepas." id="edit-password" securityType="password" setUserInformation={setUserInformation} />
                                        {/*<SecurityPreference property="Guardar informacion de incio de sesion" i="fas fa-id-card" span="Activado" description="Guarda el inicio de sesion en tu cuenta para que, no tengas que copiar la contraseña y el correo al iniciar la plataforma." id="edit-first-name" /> */}
                                    </div>
                                </div>
                            </div>
                            : attribute === 'mod=profile_information'
                                ? <div className="commomStylePadding profile_information">
                                    <div className="preference-CI-container">
                                        <div className="preference-CI-zone">
                                            <div className="preference-CI-information">
                                                <p>Numero de cedula</p>
                                                <h4>{userInformation.identification === null ? 'No definido' : userInformation.identification}</h4>
                                            </div>
                                            <p className="preference-CI-description">
                                                El numero de cedula es para llevar el control de los usuarios,
                                                tambien para evitar el mal uso de nuestra aplicacion, esto nadie
                                                lo podra ver solo usted. (este campo es obligatorio para el proveedor).
                                            </p>
                                        </div>
                                        <button id="edit-CI" onClick={() => {
                                            document.getElementById("CI").style.display = 'flex';
                                            document.querySelector('body').style.overflow = 'hidden';
                                        }}>Editar</button>
                                    </div>
                                    <div className="dark" id="CI">
                                        <div className="dark-input">
                                            <h1>Introduce el Numero de cedula</h1>
                                            <input type="number" placeholder="Introduzca su numero de indentidad" id="CI-input" />
                                            <div className="dark-button-container">
                                                <button className="save-edit" id="edit-ci" onClick={() => changeInformation('identification', document.getElementById('CI-input').value)}>Guardar</button>
                                                <button className="cancel-edit" onClick={() => {
                                                    document.getElementById("CI").style.display = 'none';
                                                    document.querySelector('body').style.overflow = 'auto';
                                                }}>Cancelar</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preference-city-container" style={{ marginTop: '10px' }}>
                                        <div className="preference-city-zone">
                                            <div className="preference-city-information">
                                                <p>Ciudad</p>
                                                <h4>{userInformation.city === null ? 'No definido' : userInformation.city}</h4>
                                            </div>
                                            <p className="preference-city-description">La ciudad es importante para que aparezca en los filtros de busquedad.</p>
                                        </div>
                                        <button id="edit-city" onClick={() => {
                                            document.getElementById("city").style.display = 'flex';
                                            document.querySelector('body').style.overflow = 'hidden';
                                        }}>Editar</button>
                                    </div>
                                    <div className="dark" id="city">
                                        <div className="dark-input">
                                            <h1>¿En que estado te encuentras?</h1>
                                            <select id="filter-city-change" defaultValue="city">
                                                <option value="city">Ciudad</option>
                                                <option value="Bogota">Bogota</option>
                                                <option value="Valle del cauca">Valle del cauca</option>
                                                <option value="Antioquia">Antioquia</option>
                                                <option value="Satander">Santander</option>
                                                <option value="Amazonas">Amazonas</option>
                                                <option value="Aracua">Aracua</option>
                                                <option value="Atlantico">Atlantico</option>
                                                <option value="Bolivar">Bolivar</option>
                                                <option value="Boyaca">Boyaca</option>
                                                <option value="Caldas">Caldas</option>
                                                <option value="Caqueta">Caqueta</option>
                                                <option value="Casanare">Casanare</option>
                                                <option value="Cauca">Cauca</option>
                                                <option value="Cesar">Cesar</option>
                                                <option value="Choco">Choco</option>
                                                <option value="Cordoba">Cordoba</option>
                                                <option value="Cundinamarca">Cundinamarca</option>
                                                <option value="Guainia">Guainia</option>
                                                <option value="Guaviare">Guaviare</option>
                                                <option value="Huila">Huila</option>
                                                <option value="La guajira">La guajira</option>
                                                <option value="Magdalena">Magdalena</option>
                                                <option value="Meta">Meta</option>
                                                <option value="Nariño">Nariño</option>
                                                <option value="Norte de santander">Norte de santander</option>
                                                <option value="Putumayo">Putumayo</option>
                                                <option value="Quindio">Quindio</option>
                                                <option value="Risaralda">Risaralda</option>
                                                <option value="San andres">San andres</option>
                                                <option value="Sucre">Sucre</option>
                                                <option value="Tolima">Tolima</option>
                                                <option value="Vaupes">Vaupes</option>
                                                <option value="Vichada">Vichada</option>
                                            </select>
                                            <div className="dark-button-container">
                                                <button className="save-edit" id="edit-ci" onClick={() => changeInformation('city', document.getElementById('filter-city-change').value)}>Guardar</button>
                                                <button className="cancel-edit" onClick={() => {
                                                    document.getElementById("city").style.display = 'none';
                                                    document.querySelector('body').style.overflow = 'auto';
                                                }}>Cancelar</button>
                                            </div>
                                        </div>
                                    </div>
                                    <PreferencePart property="Años de experiencia" value={userInformation.yearsOfExperience === null ? 'No definido' : userInformation.yearsOfExperience} id="edit-preference-years-experience" width="74%" inputType="number" placeholder="Ejemplo: 6" idInput="years-experience-input" name="yearsOfExperience" setUserInformation={setUserInformation} />
                                    <PreferencePart property="Numero de telefono" value={userInformation.phoneNumber === null ? 'No definido' : userInformation.phoneNumber} id="edit-preference-phone-number" width="74%" inputType="number" placeholder="Ejemplo: 5722329200" idInput="phone-number-input" name="phoneNumber" setUserInformation={setUserInformation} />
                                    <PreferencePart property="Disponibilidad" value={changeAvailability()} id="edit-availability" width="74%" inputType="checkbox" informationType="days" name="availability" userInformation={userInformation} setUserInformation={setUserInformation} />
                                    <PreferenceToggle idButton="class-button-toggle" idContainer="button-toggle-class" h4="Clases virtuales" p="¿Tienes la disponibilidad de tener clases virtuales?" name="virtualClasses" value={userInformation.virtualClasses} setUserInformation={setUserInformation} />
                                    <PreferenceToggle idButton="presentClass-button-toggle" idContainer="button-toggle-presentClass" h4="Clases presencial" p="¿Tienes la disponibilidad de tener clases presenciales?" name="faceToFaceClasses" value={userInformation.faceToFaceClasses} setUserInformation={setUserInformation} />
                                </div>
                                : attribute === 'mod=privacy'
                                    ? <div className="commomStylePadding privacy">
                                        <PreferenceToggle idButton="phone-button-toggle" idContainer="button-toggle-phone" h4="Quien puede ver tu numero de telefono" p="Esto es para facilitar el contacto a traves de la plataforma, los usuarios podran ver su numero de telefono desde su perfil." name="showMyNumber" value={userInformation.showMyNumber} setUserInformation={setUserInformation} />
                                    </div>
                                    : attribute === 'mod=payment' 
                                        ? <Link to="/preference/mod=payment_payu" style={{ textDecoration: 'none' }}>
                                            <div className="commomStylePadding payment" >
                                                <section className="payment-method-help-card">
                                                    <img src="/img/payu.png" alt="payu"/>
                                                    <p>Es una pasarela de pagos con más de 18 años de experiencia en el mercado y se encargará de mediar las transacciones de los clientes de tu servicio y tu banco para poder recibir las ganancias.</p>
                                                </section>
                                            </div>
                                        </Link>
                                        : attribute === 'mod=payment_payu' ? 
                                            <div className="commomStylePadding">
                                                <form onSubmit={e => e.preventDefault()} className="payment_payu-form">
                                                    <div className="form-control">
                                                        <input type="text" placeholder="Banco" value={bankData.bank} onChange={e => setBankData({ ...bankData, bank: e.target.value })}/>
                                                    </div>
                                                    <div className="form-control">
                                                        <input type="number" placeholder="Numero de cuenta" value={bankData.accountNumber} onChange={e => setBankData({ ...bankData, accountNumber: e.target.value })} maxLength="50"/>
                                                    </div>
                                                    <div className="form-control">
                                                        <select id="selectAccountType-preference" defaultValue={bankData.accountType} onChange={e => setBankData({ ...bankData, accountType: e.target.value })}>
                                                            <option value="selectAccountType" hidden>-- Tipo de cuenta --</option>
                                                            <option value="Ahorro">Ahorro</option>
                                                            <option value="Corriente">Corriente</option>
                                                        </select>
                                                    </div>
                                                    <p className="field field_value-error-handler" style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>Rellene los campos de forma correcta.</p>
                                                    <div className="form-control">
                                                        <button id="typeOfAccound-preference-save" onClick={() => bankDataValueChange()}>Guardar</button>
                                                    </div>
                                                </form>
                                            </div> : <Navigate to="/preference/mod=general" />}
                </div>
            </div>
        </div>
    );
};

export default Preference;