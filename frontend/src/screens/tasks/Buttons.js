import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verificationOfInformation } from "../../helpers";
import swal from "sweetalert";

function Buttons() {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const suspended = useSelector((state) => state.suspended);
  const block = useSelector((state) => state.block);
  const products = useSelector((state) => state.products);

  const navigate = useNavigate();

  const checkAuth = (typeOfButton) => { // ESTE COMPONENTE SE REPITE EN POST
    if (!auth) {
      swal({
        title: "No estás registrado",
        text:
          typeOfButton === "quote"
            ? "Para enviar una actividad necesitas tener una cuenta como PROFESOR ¿quieres crear una cuenta?"
            : "Para crear una publicación necesitas tener una cuenta como Alumno, ¿quieres crear una cuenta?",
        icon: "info",
        buttons: ["No", "Si"],
      }).then((res) => res && navigate("/signup"));
    } else
      navigate(
        verificationOfInformation(user.objetive, user)
          ? typeOfButton === "quote"
            ? "/send/quote"
            : "/post/activity"
          : "/complete/information"
      );
  };

  return (
    <>
      {!block && !suspended && (
        <div className="tasks-events-button-container">
          {products.length > 0 &&
            (!auth || (user && user.objetive !== "Profesor")) && (
              <button
                onClick={() => checkAuth("activity")}
                className="tasks-events-button"
              >
                Crea una publicación
              </button>
            )}
          {products.length > 0 &&
            (!auth || (user && user.objetive !== "Alumno")) && (
              <button
                onClick={() => checkAuth("quote")}
                className="tasks-events-button"
              >
                Enviar una actividad
              </button>
            )}
        </div>
      )}
    </>
  );
}

export default Buttons;
