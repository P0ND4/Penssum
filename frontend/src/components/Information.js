import { useSelector } from "react-redux";

function Information({ callback, callbackValue, controller }) {
  const user = useSelector((state) => state.user);

  return (
    <form
      className="information-container"
      onSubmit={(e) => {
        e.preventDefault();
				controller(false);
        callback(callbackValue);
      }}
    >
      <div className="information">
        <h1>PENSSUM</h1>
        <p>
          {user.objetive === "Alumno"
            ? "Para penssum lo más importante es el conocimiento, por lo tanto, toda asistencia académica que solicites a través de nuestra plataforma va acompañada de una explicación detallada."
            : "Para penssum lo más importante es el conocimiento, por lo tanto, toda asistencia académica va acompañada de una explicación detallada, del trabajo o actividad que decidas tomar."}
        </p>
        <button>
          {user.objetive === "Alumno" ? "Gracias" : "Ok"}
        </button>
      </div>
    </form>
  );
}

export default Information;
