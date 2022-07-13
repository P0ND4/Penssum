function Information ({ userInformation, callback, callbackValue, controller }){
	return (
		<div className="information-container">
			<div  className="information">
				<h1>PENSSUM</h1>
				<p>{userInformation.objetive === 'Alumno' 
					? 'Para penssum lo más importante es el conocimiento, por lo tanto, toda asistencia académica que solicites a través de nuestra plataforma va acompañada de una explicación detallada.' 
				    : 'Para penssum lo más importante es el conocimiento, por lo tanto, toda asistencia académica va acompañada de una explicación detallada, del trabajo o actividad que decidas tomar.'}</p>
				<button onClick={() => {
					controller(false);
					callback(callbackValue);
				}}>{userInformation.objetive === 'Alumno' ? 'Gracias' : 'Ok'}</button>			
			</div>
		</div>
	);
};

export default Information;