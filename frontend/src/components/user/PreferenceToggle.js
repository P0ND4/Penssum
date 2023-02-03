import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
// Slice redux
import { save } from '../../features/user/userSlice';

//

import { changePreferenceValue } from '../../api';
import Cookies from 'universal-cookie';

const cookies = new Cookies();


function PreferencePrivacy(data) {
    const [buttonToggleEvent, setButtonToggleEvent] = useState(false);
    const [petition,setPetition] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => { setButtonToggleEvent(data.value) },[data]);

    useEffect(() => {
        const buttonToggle = document.getElementById(data.idButton);
        const stateSpan = document.querySelector(`#${data.idContainer} span`);
        
        buttonToggleEvent ? buttonToggle.classList.add('button-animated-active') : buttonToggle.classList.remove('button-animated-active');
        buttonToggleEvent ? stateSpan.textContent = 'Activado' : stateSpan.textContent = 'Desactivado';
        buttonToggleEvent ? stateSpan.style.color = '#3282B8' : stateSpan.style.color = '#283841';
    });

    const changeValue = async () => {
        setButtonToggleEvent(!buttonToggleEvent);
        setPetition(true);

        const valueToChange = {
            id: cookies.get('id'),
            name: data.name,
            value: !buttonToggleEvent
        };

        const result = await changePreferenceValue(valueToChange);
        dispatch(save(result));
        setPetition(false);
    };

    return (
        <div className="privacy-zone" style={{ opacity: !petition ? '1' : '.6' }}>
            <div className="privacy-zone-information">
                <h4>{data.h4}</h4>
                <p>{data.p}</p>
            </div>
            <div className="button-toggle-zone" id={data.idContainer}>
                <span>Desactivado</span>
                <div className="button-animated" onClick={() => { if (!petition) changeValue() }}>
                    <button id={data.idButton} className="button-toggle"></button>
                </div>
            </div>
        </div>
    );
};

export default PreferencePrivacy;