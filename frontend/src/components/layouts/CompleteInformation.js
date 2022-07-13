import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { sendCompleteInformation } from '../../api';
import { thousandsSystem } from '../helpers';

function CompleteForm ({ userInformation, setUserInformation }) {
	const [valuePerHourString,setValuePerHourString] = useState('');

	useEffect(() => {
		if (userInformation) { setValuePerHourString(userInformation.valuePerHour ? thousandsSystem(userInformation.valuePerHour) : '') };
	},[userInformation]);

	const [data, setData] = useState({
        firstName: userInformation.firstName ? userInformation.firstName : '',
        secondName: userInformation.secondName ? userInformation.secondName : '',
        lastName: userInformation.lastName ? userInformation.lastName : '',
        secondSurname: userInformation.secondSurname ? userInformation.secondSurname : '',
        phoneNumber: userInformation.phoneNumber ? userInformation.phoneNumber : '',
        identification: userInformation.identification ? userInformation.identification : '',
        originalDescription: userInformation.originalDescription ? userInformation.originalDescription : '',
        valuePerHour: userInformation.valuePerHour ? userInformation.valuePerHour : 0,
    });

	const [field, setField] = useState({
        firstName: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.firstName ? true : false : true,
        secondName: userInformation.objetive === 'Profesor' ? userInformation.secondName ? true : false : true,
        lastName: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.lastName ? true : false : true,
        secondSurname: userInformation.objetive === 'Profesor' ? userInformation.secondSurname ? true : false : true,
        phoneNumber: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.phoneNumber ? true : false : true,
        identification: userInformation.objetive === 'Profesor' ? userInformation.identification ? true : false : true,
        originalDescription: userInformation.objetive === 'Profesor' ? userInformation.originalDescription ? true : false : true,
        valuePerHour: userInformation.objetive === 'Profesor' ? userInformation.valuePerHour ? true : false : true
    });
	const [sendingInformation,setSendingInformation] = useState(false);

	const navigate = useNavigate();

	const validate = () => {
		if (userInformation.objetive === 'Profesor') {
			if (field.firstName && field.secondName && field.lastName && field.secondSurname && field.phoneNumber && field.identification && field.originalDescription) return true
			else return false;
		};

		if (userInformation.objetive === 'Alumno') {
			if (field.firstName && field.lastName && field.phoneNumber) return true
			else return false;
		};
	};

    const expressions = {
        textLimit: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
        description: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{1,250}$/,
        numberLimit: /^[0-9]{5,20}$/,
        numberString: /^[0-9.]{2,20}$/
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

    const changeEvent = (e,value) => {
        setData({
            ...data,
            [e.target.name]: value ? value : e.target.value
        });

        const targetName = e.target.name;
        const input = e.target;

        if (targetName === "firstName") { validateField(expressions.textLimit, input) };
        if (targetName === "secondName") { validateField(expressions.textLimit, input) };
        if (targetName === "lastName") { validateField(expressions.textLimit, input) };
        if (targetName === "secondSurname") { validateField(expressions.textLimit, input) };
        if (targetName === "phoneNumber") { validateField(expressions.numberLimit, input) };
        if (targetName === "identification") { validateField(expressions.numberLimit, input) };
        if (targetName === "originalDescription") { validateField(expressions.description, input) };
        if (targetName === "valuePerHour") { validateField(expressions.numberString, input) };
    };

    const sendInformation = async () => {
    	let information;

    	if (userInformation.objetive === 'Profesor') information = data
    	else {
    		information = {
    			firstName: data.firstName,
    			lastName: data.lastName,
    			phoneNumber: data.phoneNumber	
    		};
    	};;

    	setSendingInformation(true);
    	const user = await sendCompleteInformation({ id: userInformation._id, data: information });
    	setUserInformation(user);
    	setSendingInformation(false);

    	swal({
            title: '!EXITO!',
            text: 'Tu información ha sido verificada, puedes utilizar PENSSUM con libertad.',
            icon: 'success',
            timer: '3000',
            button: false,
        }).then(() => navigate(`/${userInformation.username}`));
    };

	return (
		<div className="complete-form-container">
			<div className="complete-form">
				<form onSubmit={e => {
					e.preventDefault();
					if (validate() && !sendingInformation) sendInformation();
				}}>
					<div className="complete-form-title">
						<h1>FORMULARIO</h1>
						<p>Debes completar este formulario para usar su cuenta con libertad.</p>
					</div>
					{(userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno') && (
						<div className="form-control">
							<input name="firstName" type="text" placeholder="Primer nombre" onChange={changeEvent} defaultValue={userInformation.firstName}/>
							<p className="field field_firstName">El nombre no puede superar los 16 caracteres tener ni numeros.</p>
						</div>
					)}
					{userInformation.objetive === 'Profesor' && (
						<div className="form-control">
							<input name="secondName" type="text" placeholder="Segundo nombre" onChange={changeEvent} defaultValue={userInformation.secondName}/>
							<p className="field field_secondName">El segundo nombre no puede superar los 16 caracteres tener ni numeros.</p>
						</div>
					)}
					{(userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno') && (
						<div className="form-control">
							<input name="lastName" type="text" placeholder="Primer apellido" onChange={changeEvent} defaultValue={userInformation.lastName}/>
							<p className="field field_lastName">El apellido no puede superar los 16 caracteres tener ni numeros.</p>
						</div>
					)}
					{userInformation.objetive === 'Profesor' && (
						<div className="form-control">
							<input name="secondSurname" type="text" placeholder="Segundo apellido" onChange={changeEvent} defaultValue={userInformation.secondSurname}/>
							<p className="field field_secondSurname">El segundo apellido no puede superar los 16 caracteres tener ni numeros.</p>
						</div>
					)}
					{(userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno') && (
						<div className="form-control">
							<input name="phoneNumber" type="number" placeholder="Numero de telefono" onChange={changeEvent} defaultValue={userInformation.phoneNumber}/>
							<p className="field field_phoneNumber">El numero de telefono no puede superar los 20 dijitos.</p>
						</div>
					)}
					{userInformation.objetive === 'Profesor' && (
						<div className="form-control">
							<input name="identification" type="number" placeholder="Cedula de identidad" onChange={changeEvent} defaultValue={userInformation.identification}/>
							<p className="field field_identification">Identificacion invalida.</p>
						</div>
					)}
					{userInformation.objetive === 'Profesor' && (
						<div className="form-control">
							<input name="valuePerHour" type="text" placeholder="Valor por hora (COP)" onChange={e => {
								var num = e.target.value.replace(/\./g,'');
                                if(!isNaN(num)){
                                    changeEvent(e,parseInt(e.target.value.replace(/\./g, '')));
                                    num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
                                    num = num.split('').reverse().join('').replace(/^[.]/,'');
                                    setValuePerHourString(num);
                                } else setValuePerHourString(e.target.value.replace(/[^\d.]*/g,''));
							}} value={valuePerHourString}/>
							<p className="field field_valuePerHour">El valor por hora no puede ser menor que 2 dijitos ni superar los 20.</p>
						</div>
					)}
					{userInformation.objetive === 'Profesor' && (
						<div>
							<div className="complete-form-description-zone">
			                    <textarea name="originalDescription" className="complete-form-textarea" onChange={e => {
			                    	changeEvent(e)
			                    	document.getElementById('letter-count-description-textarea').textContent = `${e.target.value.length}/250`;
			                    }} maxLength={250} placeholder="Una breve descripción sobre las asignaturas que manejas y los temas de dichas asignaturas, de esta manera los estudiantes podrán encontrarte con facilidad. TE DESEAMOS EXÍTOS." id="preference-description-input" defaultValue={userInformation.originalDescription}></textarea>
			                    <span id="letter-count-description-textarea">{userInformation.originalDescription.length}/250</span>
			                </div>
			                <p className="field field_originalDescription">La description no puede superar los 250 caracteres.</p>
						</div>
					)}
					<div className="complete-form-button-container">
						<Link id="cancel-complete-form" to={`/${userInformation.username}`}>Cancelar</Link>
						<button 
							style={{ 
                                background: !validate() || sendingInformation ? '#3282B8' : '', 
                                opacity: !validate() || sendingInformation ? '.4' : '', 
                                cursor: !validate() || sendingInformation ? 'not-allowed' : '' 
                            }}
							id="save-complete-form"
						>Guardar</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CompleteForm;