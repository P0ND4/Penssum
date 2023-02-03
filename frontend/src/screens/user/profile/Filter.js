import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { verificationOfInformation } from "../../../helpers";
import swal from "sweetalert";

function Filter() {
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const suspended = useSelector((state) => state.suspended);
  const { user: foundUserInformation, isBlocked } = useSelector(
    (state) => state.profile
  );

  const { username } = useParams();
  const navigate = useNavigate();

  const checkAuth = (typeOfButton) => {
    if (!auth) {
      swal({
        title: "No estás registrado",
        text:
          typeOfButton === "quote"
            ? "Para enviar una actividad necesitas tener una cuenta como PROFESOR ¿quieres crear una cuenta?"
            : "Para hacer una publicación necesitas tener una cuenta como Alumno, ¿quieres crear una cuenta?",
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
    <section className="filter-container">
      {!isBlocked.blocked && (
        <div className="profile-options">
          {auth &&
          foundUserInformation.showMyNumber &&
          foundUserInformation.phoneNumber !== null ? (
            <div id="profile-phone-number">
              {foundUserInformation.phoneNumber}
            </div>
          ) : (
            ""
          )}
          {user.username === username &&
            !suspended &&
            user.objetive !== "Profesor" && (
              <button id="create-post" onClick={() => checkAuth("activity")}>
                Crear una publicación
              </button>
            )}
          {!suspended && user.objetive !== "Alumno" && (
            <button id="send-quote" onClick={() => checkAuth("quote")}>
              Enviar actividad
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default Filter;
