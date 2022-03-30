import { useEffect, useState } from "react";
import { changePreferenceValue } from "../../../api";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function PreferencePart(data) {
    const [information, setInformation] = useState('');
    const [dayOfTheWeek, setDayOfTheWeek] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });

    useEffect(() => {
        if (data.userInformation) {
            const days = data.userInformation.availability;
            setDayOfTheWeek({
                monday: days.monday,
                tuesday: days.tuesday,
                wednesday: days.wednesday,
                thursday: days.thursday,
                friday: days.friday,
                saturday: days.saturday,
                sunday: days.sunday
            });
        };
    }, [data]);

    function changeDayOfTheWeek(element) {
        element.classList.toggle('checkbox-day-active');
        (element.classList.contains('checkbox-day-active'))
            ? setDayOfTheWeek({ ...dayOfTheWeek, [element.getAttribute('name')]: true })
            : setDayOfTheWeek({ ...dayOfTheWeek, [element.getAttribute('name')]: false });
    };

    const regularExpression = {
        textLimit: /^[a-zA-Za]{0,16}$/,
        numberLimit: /^[0-9]{0,20}$/,
        emailLimit: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/
    };

    const validation = (typeData,typeExpression) => {
        if (data.inputType === typeData) {
            if (typeExpression.test(document.getElementById(data.idInput).value)) {
                return true;
            };
            return false;
        };
    };

    const changeInformation = async (type,errorP) => {
        if (type === 'information') {
           const textResult = validation('text',regularExpression.textLimit);
           const numberResult = validation('number',regularExpression.numberLimit);
           if (!textResult && !numberResult) {
                document.querySelector(errorP).classList.add('showError');              
                setTimeout(() => document.querySelector(errorP).classList.remove('showError'),2000);
               return;
           }
        }

        document.getElementById(data.property).style.display = 'none';
        document.querySelector('body').style.overflow = 'auto';

        const valueToChange = {
            id: cookies.get('id'),
            name: data.name,
            value: (type === 'information') ? information : dayOfTheWeek
        };

        const result = await changePreferenceValue(valueToChange);
        data.setUserInformation(result);
    };

    return (
        <div>
            <div className="general-preference-card">
                <div className="general-preference" style={{ width: data.width }}>
                    <p>{data.property}</p>
                    <h4>{data.value}</h4>
                </div>
                <button onClick={() => {
                    document.getElementById(data.property).style.display = 'flex';
                    document.querySelector('body').style.overflow = 'hidden';
                }}>Editar</button>
            </div>
            {!data.informationType ?
                <div className="dark" id={data.property}>
                    <div className="dark-input">
                        <h1>Introduce el {data.property}</h1>
                        <p className={`field field_${data.id}`} style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '5px 0' }}>Ingrese un formato valido.</p>
                        <input type={data.inputType} placeholder={data.placeholder} id={data.idInput} onChange={e => setInformation(e.target.value)} />
                        <div className="dark-button-container">
                            <button className="save-edit" id={data.id} onClick={() => changeInformation('information',`.field_${data.id}`)}>Guardar</button>
                            <button className="cancel-edit" onClick={() => {
                                document.getElementById(data.property).style.display = 'none';
                                document.querySelector('body').style.overflow = 'auto';
                            }}>Cancelar</button>
                        </div>
                    </div>
                </div>
                : <div className="dark" id={data.property}>
                    <div className="dark-input">
                        <h1>Elija la Disponibilidad</h1>
                        <div className="checkbox-week-day">
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.monday ? 'checkbox-day-active' : ''}`} name="monday" id="check-monday-edit" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Lunes</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.tuesday ? 'checkbox-day-active' : ''}`} id="check-tuesday-edit" name="tuesday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Martes</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.wednesday ? 'checkbox-day-active' : ''}`} id="check-wednesday-edit" name="wednesday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Miercoles</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.thursday ? 'checkbox-day-active' : ''}`} id="check-thursday-edit" name="thursday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Jueves</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.friday ? 'checkbox-day-active' : ''}`} id="check-friday-edit" name="friday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Viernes</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.saturday ? 'checkbox-day-active' : ''}`} id="check-saturday-edit" name="saturday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Sabado</p>
                            </div>
                            <div>
                                <div className={`checkbox-day ${dayOfTheWeek.sunday ? 'checkbox-day-active' : ''}`} id="check-sunday-edit" name="sunday" onClick={e => changeDayOfTheWeek(e.target)}></div>
                                <p>Domingo</p>
                            </div>
                        </div>
                        <div className="dark-button-container">
                            <button className="save-edit" id={data.id} onClick={() => changeInformation('availability')}>Guardar</button>
                            <button className="cancel-edit" onClick={() => {
                                document.getElementById(data.property).style.display = 'none';
                                document.querySelector('body').style.overflow = 'auto';
                            }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            }

        </div>
    );
};

export default PreferencePart;