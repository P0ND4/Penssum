import { changeDashboardPreference } from '../../../api';
import { useState } from 'react';

function DashboardPreferencePart(data) {
    const [information, setInformation] = useState('');

    const regularExpression = {
        textLimit: /^[a-zA-Za]{0,16}$/,
        emailLimit: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/
    };

    const validation = (typeData, typeExpression) => {
        if (data.inputType === typeData) {
            if (typeExpression.test(document.getElementById(data.idInput).value)) {
                return true;
            };
            return false;
        };
    };

    const changeInformation = async (errorP) => {
        let validateField;

        if (data.inputType === 'text') validateField = validation('text', regularExpression.textLimit);
        if (data.inputType === 'email') validateField = validation('email', regularExpression.emailLimit);

        if (!validateField) {
            document.querySelector(errorP).classList.add('showError');
            setTimeout(() => document.querySelector(errorP).classList.remove('showError'), 2000);
            return;
        }

        document.getElementById(data.property).style.display = 'none';
        document.querySelector('body').style.overflow = 'auto';

        const valueToChange = {
            name: data.name,
            value: information
        };

        await changeDashboardPreference(valueToChange);
        data.setInformation({ ...data.information, [data.name]: information });
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
            <div className="dark" id={data.property}>
                <div className="dark-input">
                    <h1>Introduce el {data.property}</h1>
                    <p className={`field field_${data.id}`} style={{ textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '5px 0' }}>Ingrese un formato valido.</p>
                    <input type={data.inputType} placeholder={data.placeholder} id={data.idInput} onChange={e => setInformation(e.target.value)} />
                    <div className="dark-button-container">
                        <button className="save-edit" id={data.id} onClick={() => changeInformation(`.field_${data.id}`)}>Guardar</button>
                        <button className="cancel-edit" onClick={() => {
                            document.getElementById(data.property).style.display = 'none';
                            document.querySelector('body').style.overflow = 'auto';
                        }}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPreferencePart;