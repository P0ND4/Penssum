import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { sendCompleteInformation, changePreferenceValue } from '../../api';
import { thousandsSystem } from '../helpers';
import Subject from '../parts/Subject';

function CompleteForm ({ userInformation, setUserInformation, zone, setZone }) {
	const [valuePerHourString,setValuePerHourString] = useState('');
	const [count,setCount] = useState(1);
	const [selectedSubject,setSelectedSubject] = useState([]);
	const [tags,setTags] = useState([]);
 
	useEffect(() => {
		if (zone === 'main') setCount(1);
		if (zone === 'subjects') setCount(2);
		if (zone === 'topics') setCount(3);
	},[zone]);

	useEffect(() => {
		if (userInformation.specialty.subjects.length > 0) {
			const subjects = userInformation.specialty.subjects.split(',').map(subject => subject.trimLeft());
			setSelectedSubject(subjects);
		};

		if (userInformation.specialty.topics.length > 0) {
			const topics = userInformation.specialty.topics.split(',').map(topic => topic.trimLeft());
			setTags(topics);
		};
	},[userInformation]);

	useEffect(() => window.scrollTo(0, 0),[count]);

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
        description: userInformation.description ? userInformation.description : '',
        valuePerHour: userInformation.valuePerHour ? userInformation.valuePerHour : 0,
    });

	const [field, setField] = useState({
        firstName: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.firstName ? true : false : true,
        secondName: userInformation.objetive === 'Profesor' ? userInformation.secondName ? true : false : true,
        lastName: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.lastName ? true : false : true,
        secondSurname: userInformation.objetive === 'Profesor' ? userInformation.secondSurname ? true : false : true,
        phoneNumber: userInformation.objetive === 'Profesor' || userInformation.objetive === 'Alumno' ? userInformation.phoneNumber ? true : false : true,
        identification: userInformation.objetive === 'Profesor' ? userInformation.identification ? true : false : true,
        description: userInformation.objetive === 'Profesor' ? userInformation.description ? true : false : true,
        valuePerHour: userInformation.objetive === 'Profesor' ? userInformation.valuePerHour ? true : false : true
    });
	const [sendingInformation,setSendingInformation] = useState(false);

	const navigate = useNavigate();

	const validate = () => {
		if (userInformation.objetive === 'Profesor') {
			if (field.firstName && field.secondName && field.lastName && field.secondSurname && field.phoneNumber && field.identification && field.description) return true
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
        if (targetName === "description") { validateField(expressions.description, input) };
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

    	if (userInformation.objetive === 'Profesor') setZone('subjects') 
		else {
    		swal({
	            title: '!EXITO!',
	            text: 'Tu información ha sido verificada, puedes utilizar PENSSUM con libertad.',
	            icon: 'success',
	            timer: '3000',
	            button: false,
	        }).then(() => navigate(`/${userInformation.username}`));
    	};
    };

    const styleProgressCircle = circle => {
		return {
			border: circle <= count ? '4px solid #3282B8' : '',
			background: circle <= count ? '#3282B8' : '',
			color: circle <= count ? '#FFFFFF' : ''
		};
    };

	const chosen = async (name,value) => {
		const valueInString = value.join(', ');

		const valueToChange = {
            id: userInformation._id,
            name,
            value: valueInString
        };

		const result = await changePreferenceValue(valueToChange);
		setUserInformation(result);

		if (name === 'subjects') setZone('topics')
		else { 
			swal({
	            title: '!EXITO!',
	            text: 'Tu información esta completa puedes usar tu cuenta con seguridad.',
	            icon: 'success',
	            timer: '3000',
	            button: false,
	        }).then(() => {
				navigate(`/${userInformation.username}`);
				setZone('main');
			});
		};
	};

	const changeTopics = e => {
		if (e.key === 'Enter') {
			let tag = e.target.value.replace(/\s+/g,' ').trimLeft().trimRight();
			if (tag.length > 0) {
				if (tags.length < 100) {
					let currentTags = [...tags];
					tag.split(',').map(tag => tag !== '' && !tags.includes(tag) && currentTags.push(tag.slice(0,40)));
					setTags(currentTags);
				};
				e.target.value = '';
			};
		};
	};

	return (
		<div className="complete-form-container">
			{userInformation.objetive === 'Profesor' && (
				<div className="progress-bar-container">
					<div className="progress" style={{ width: `${(((count - 1) / (3 - 1)) * 100)}%` }}></div>
					<div className="progress-circle" style={styleProgressCircle(1)}>1</div>
					<div className="progress-circle" style={styleProgressCircle(2)}>2</div>
					<div className="progress-circle" style={styleProgressCircle(3)}>3</div>
				</div>
			)}
			{zone === 'main' && ( 
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
				                    <textarea name="description" className="complete-form-textarea" onChange={e => {
				                    	changeEvent(e)
				                    	document.getElementById('letter-count-description-textarea').textContent = `${e.target.value.length}/250`;
				                    }} maxLength={250} placeholder="Has una breve descripción de quien eres." id="preference-description-input" defaultValue={userInformation.description}></textarea>
				                    <span id="letter-count-description-textarea">{userInformation.description.length}/250</span>
				                </div>
				                <p className="field field_description">La description no puede superar los 250 caracteres.</p>
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
							>{userInformation.objetive === 'Alumno' ? 'Guardar' : 'Continuar'}</button>
						</div>
					</form>
			</div>)}
			{zone === 'subjects' && (
				<div className="complete-form-subjects">
					<div className="complete-form-title">
						<h1>MATERIAS</h1>
						<p>Elija hasta cinco materias que disfrute enseñar. Ésto nos va ayudar a recomendarlo con estudiantes.</p>
					</div>
					<div className="complete-form-subjects-container"> 	
						<Subject image="/img/subjects/acueducto-y-alcantarillado.jpg" title="Acueducto y alcantarillado"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Acueducto y alcantarillado")}/>
						<Subject image="/img/subjects/algebra-lineal.jpg" title="Algebra lineal"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Algebra lineal")}/>
						<Subject image="/img/subjects/algoritmos.jpg" title="Algoritmos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Algoritmos")}/>
						<Subject image="/img/subjects/analisis-de-estructura.jpg" title="Análisis de estructura"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Analisis de estructura")}/>
						<Subject image="/img/subjects/arquitectura-de-software.jpg" title="Arquitectura de software"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Arquitectura de software")}/>
						<Subject image="/img/subjects/arquitectura-del-computador.jpg" title="Arquitectura del computador"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Arquitectura del computador")}/>
						<Subject image="/img/subjects/automatismos.jpg" title="Automatismos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Automatismos")}/>
						<Subject image="/img/subjects/biology.jpg" title="Biología celular"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Biologia celular")}/>
						<Subject image="/img/subjects/bioquimica.jpg" title="Bioquímica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Bioquimica")}/>
						<Subject image="/img/subjects/calculo-diferencial.jpg" title="Calculo diferencial"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Calculo diferencial")}/>
						<Subject image="/img/subjects/calculo-integral.png" title="Calculo integral"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Calculo integral")}/>
						<Subject image="/img/subjects/calculo-vectorial.png" title="Calculo vectorial"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Calculo vectorial")}/>
						<Subject image="/img/subjects/circuitos-de-energia.jpg" title="Circuitos de energía"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Circuitos de energia")}/>
						<Subject image="/img/subjects/circuitos-electricos.jpg" title="Circuitos eléctricos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Circuitos electricos")}/>
						<Subject image="/img/subjects/computacion-en-paralelo.jpg" title="Computación en paralelo"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Computacion en paralelo")}/>
						<Subject image="/img/subjects/control-de-calidad.jpg" title="Control de calidad"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Control de calidad")}/>
						<Subject image="/img/subjects/ethics.jpg" title="Control de productividad"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Control de productividad")}/>
						<Subject image="/img/subjects/control-electrico.png" title="Control eléctrico"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Control electrico")}/>
						<Subject image="/img/subjects/costos.png" title="Costos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Costos")}/>
						<Subject image="/img/subjects/dibujos-electricos.jpg" title="Dibujos eléctricos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Dibujos electricos")}/>
						<Subject image="/img/subjects/dinamica.jpg" title="Dinámica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Dinamica")}/>
						<Subject image="/img/subjects/diseno-de-plantas-de-proceso.jpg" title="Diseño de plantas de proceso"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Diseno de plantas de proceso")}/>
						<Subject image="/img/subjects/diseno-de-vias.jpg" title="Diseño de vías"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Diseno de vias")}/>
						<Subject image="/img/subjects/diseno-mecanico.jpg" title="Diseño mecánico"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Diseno mecanico")}/>
						<Subject image="/img/subjects/ecology.jpg" title="Ecología"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ecologia")}/>
						<Subject image="/img/subjects/ecuaciones-diferenciales.jpg" title="Ecuaciones diferenciales"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ecuaciones diferenciales")}/>
						<Subject image="/img/subjects/electronica-basica.jpg" title="Electrónica basica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Electronica basica")}/>
						<Subject image="/img/subjects/electronica-complementaria.jpg" title="Electrónica complementaria"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Electronica complementaria")}/>
						<Subject image="/img/subjects/electronica-de-potencia.jpg" title="Electrónica de potencia"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Electronica de potencia")}/>
						<Subject image="/img/subjects/economy.jpg" title="Estadísticas inferencial"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Estadisticas inferencial")}/>
						<Subject image="/img/subjects/estadisticas-y-probabilidad.jpg" title="Estadísticas y probabilidad"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Estadisticas y probabilidad")}/>
						<Subject image="/img/subjects/estructura-de-datos.png" title="Estructura de datos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Estructura de datos")}/>
						<Subject image="/img/subjects/estructura-geotermica.jpg" title="Estructura geotérmica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Estructura geotermica")}/>
						<Subject image="/img/subjects/estatica.jpg" title="Estática"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Estatica")}/>
						<Subject image="/img/subjects/fundamentos-de-programacion.jpg" title="Fundamentos de Programación"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Fundamentos de Programacion")}/>
						<Subject image="/img/subjects/fisica-electrica.jpg" title="Física eléctrica y magnetismo"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Fisica electrica y magnetismo")}/>
						<Subject image="/img/subjects/physical.jpg" title="Física mecánica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Fisica mecanica")}/>
						<Subject image="/img/subjects/fisica-ondulatoria.jpg" title="Física ondulatoria"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Fisica ondulatoria")}/>
						<Subject image="/img/subjects/science.jpg" title="Geociencia"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Geociencia")}/>
						<Subject image="/img/subjects/geometria-analitica.jpg" title="Geometría analítica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Geometria analitica")}/>
						<Subject image="/img/subjects/geomatica.jpg" title="Geomática"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Geomatica")}/>
						<Subject image="/img/subjects/hidrologia.jpg" title="Hidrología"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Hidrologia")}/>
						<Subject image="/img/subjects/hidraulica.jpg" title="Hidráulica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Hidraulica")}/>
						<Subject image="/img/subjects/infraestructura.jpg" title="Infraestructura"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Infraestructura")}/>
						<Subject image="/img/subjects/infraestructura-para-ti.jpg" title="Infraestructura para TI"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Infraestructura para TI")}/>
						<Subject image="/img/subjects/ingenieria-reacciones.jpg" title="Ingeniería de reacciones"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ingenieria de reacciones")}/>
						<Subject image="/img/subjects/ingenieria-de-software.jpg" title="Ingeniería de software"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ingenieria de software")}/>
						<Subject image="/img/subjects/ingenieria-de-transito.jpg" title="Ingeniería de tránsito"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ingenieria de transito")}/>
						<Subject image="/img/subjects/ingenieria-economica.jpg" title="Ingeniería económica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ingenieria economica")}/>
						<Subject image="/img/subjects/instalaciones-electricas.jpg" title="Instalaciones eléctricas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Instalaciones electricas")}/>
						<Subject image="/img/subjects/instrumentacion-electronica.jpg" title="Instrumentación electrónica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Instrumentacion electronica")}/>
						<Subject image="/img/subjects/instrumentacion-y-control.jpg" title="Instrumentación y control"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Instrumentacion y control")}/>
						<Subject image="/img/subjects/inteligencia-artificial.jpg" title="Inteligencia artificial"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Inteligencia artificial")}/>
						<Subject image="/img/subjects/research.jpg" title="Inventarios"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Inventarios")}/>
						<Subject image="/img/subjects/manejo-de-solidos.jpg" title="Manejo de sólidos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Manejo de solidos")}/>
						<Subject image="/img/subjects/maquinas-electricas.jpg" title="Maquinas eléctricas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Maquinas electricas")}/>
						<Subject image="/img/subjects/matematicas-basicas.jpg" title="Matemáticas básicas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Matematicas basicas")}/>
						<Subject image="/img/subjects/math.jpg" title="Matemáticas discretas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Matematicas discretas")}/>
						<Subject image="/img/subjects/materia-y-energia.jpg" title="Materia y energía"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Materia y energia")}/>
						<Subject image="/img/subjects/mecanica-de-fluidos.jpg" title="Mecánica de fluidos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Mecanica de fluidos")}/>
						<Subject image="/img/subjects/microbiologia.jpg" title="Microbiología"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Microbiologia")}/>
						<Subject image="/img/subjects/ondas-y-lineas-de-transmision.png" title="Ondas y líneas de transmisión"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Ondas y lineas de transmision")}/>
						<Subject image="/img/subjects/social.jpg" title="Operaciones unitarias"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Operaciones unitarias")}/>
						<Subject image="/img/subjects/pavimentos.jpg" title="Pavimentos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Pavimentos")}/>
						<Subject image="/img/subjects/procesamiento-numerico.jpg" title="Procesamiento numérico"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Procesamiento numerico")}/>
						<Subject image="/img/subjects/procesos-de-fabricacion.jpg" title="Procesos de fabricación"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Procesos de fabricacion")}/>
						<Subject image="/img/subjects/procesos-de-separacion.png" title="Procesos de separación"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Procesos de separacion")}/>
						<Subject image="/img/subjects/procesos-estocasticos.png" title="Procesos estocásticos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Procesos estocasticos")}/>
						<Subject image="/img/subjects/procesos-industriales.jpg" title="Procesos industriales"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Procesos industriales")}/>
						<Subject image="/img/subjects/productividad.jpg" title="Productividad"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Productividad")}/>
						<Subject image="/img/subjects/chemistry.jpg" title="Química general"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Quimica general")}/>
						<Subject image="/img/subjects/quimica-inorganica.jpg" title="Química inorgánica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Quimica inorganica")}/>
						<Subject image="/img/subjects/quimica-organica.jpg" title="Química orgánica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Quimica organica")}/>
						<Subject image="/img/subjects/redes-de-comunicacion.jpg" title="Redes de comunicación"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Redes de comunicacion")}/>
						<Subject image="/img/subjects/refrigeracion-y-aire-acondicionado.jpg" title="Refrigeración y aire acondicionado"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Refrigeracion y aire acondicionado")}/>
						<Subject image="/img/subjects/resistencia-de-materiales.jpg" title="Resistencia de materiales"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Resistencia de materiales")}/>
						<Subject image="/img/subjects/senales-electricas.jpg" title="Señales eléctricas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Senales electricas")}/>
						<Subject image="/img/subjects/simulacion-de-procesos.png" title="Simulación de procesos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Simulacion de procesos")}/>
						<Subject image="/img/subjects/sistema-de-transporte.jpg" title="Sistema de transporte"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistema de transporte")}/>
						<Subject image="/img/subjects/sistema-y-modelo.png" title="Sistema y modelo"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistema y modelo")}/>
						<Subject image="/img/subjects/sistemas-de-energia.jpg" title="Sistemas de energía"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas de energia")}/>
						<Subject image="/img/subjects/sistemas-de-potencia.jpg" title="Sistemas de potencia"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas de potencia")}/>
						<Subject image="/img/subjects/sistemas-de-tratamiento-de-agua.jpg" title="Sistemas de tratamiento de agua"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas de tratamiento de agua")}/>
						<Subject image="/img/subjects/sistemas-digitales.jpg" title="Sistemas digitales"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas digitales")}/>
						<Subject image="/img/subjects/sistemas-embebidos.jpg" title="Sistemas embebidos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas embebidos")}/>
						<Subject image="/img/subjects/sistemas-operativos.jpg" title="Sistemas operativos"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Sistemas operativos")}/>
						<Subject image="/img/subjects/subestaciones-electricas.jpg" title="Subestaciones eléctricas"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Subestaciones electricas")}/>
						<Subject image="/img/subjects/termodinamica.png" title="Termodinámica"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Termodinamica")}/>
						<Subject image="/img/subjects/transferencia-de-calor.jpg" title="Transferencia de calor"  select={true} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} isActive={selectedSubject.includes("Transferencia de calor")}/>
					</div>
					<div className="complete-form-button-container">
						<Link id="cancel-complete-form" to={`/${userInformation.username}`}>Definir más tarde</Link>
						<button 
							style={{ 
		                           background: !validate() || sendingInformation ? '#3282B8' : '', 
		                           opacity: !validate() || sendingInformation ? '.4' : '', 
		                           cursor: !validate() || sendingInformation ? 'not-allowed' : '' 
		                       }}
							id="save-complete-form"
							onClick={() => chosen('subjects',selectedSubject)}
						>Continuar</button>
					</div>
				</div>
			)}
			{zone === 'topics' && (
				<div className="complete-form-topics">
					<div className="complete-form-title">
						<h1>TEMAS</h1>
						<p>Elija los temas que da en cada materia. Ésto es lo principal para que aparezca en la barra de busquedad.</p>
					</div>
					<div className="complete-form-topics-container">
						<p>Preciona "ENTER" o añade una coma despues de cada etiqueta</p>
						<ul>
							{tags.map((tag,index) => (
								<li key={tag+index}>{tag} <i className="fa-solid fa-xmark" onClick={() => {
									setTags(tags.filter(currentTag => currentTag !== tag));
								}}></i></li>
							))}
							<input type="text" onKeyUp={changeTopics}/>
						</ul>
						<div className="tag-details">
							<p><span>{100 - tags.length}</span> Etiquetas faltantes</p>
							<button onClick={() => setTags([])}>Remover Todo</button>
						</div>
					</div>
					<div className="complete-form-button-container">
						<Link id="cancel-complete-form" to={`/${userInformation.username}`}>Definir más tarde</Link>	
						<button 
							style={{ 
								background: !validate() || sendingInformation ? '#3282B8' : '', 
								opacity: !validate() || sendingInformation ? '.4' : '', 
								cursor: !validate() || sendingInformation ? 'not-allowed' : '' 
							}}
							id="save-complete-form"
							onClick={() => chosen('topics',tags)}
						>Guardar</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CompleteForm;