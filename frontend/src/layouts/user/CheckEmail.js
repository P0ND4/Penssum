import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { changeMail } from "../../api";
import swal from "sweetalert";
import Loading from "../../components/Loading";

// Slice redux
import { save } from "../../features/user/userSlice";
import { inactive } from "../../features/user/registrationControlSlice";

//

function CheckEmail() {
  const user = useSelector(state => state.user);
  const registration = useSelector(state => state.registration);

  const [data, setData] = useState("");
  const [sendingInformation, setSendingInformation] = useState(false);

  const regularExpresionMail =
    /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/;

  const dispatch = useDispatch();

  useEffect(() => dispatch(inactive()));
  useEffect(() => {
    if (
      registration.validated !== null &&
      !registration.validated &&
      registration.selection
    ) {
      document.getElementById("input-check-email").value =
      user.email;
      setData(user.email);
    }
  }, [user.email, registration]);

  const change = async () => {
    if (data !== user.email) {
      if (!regularExpresionMail.test(data)) {
        document
          .querySelector(".field_error-change-mail-invalid")
          .classList.add("showError");
        setTimeout(
          () =>
            document
              .querySelector(".field_error-change-mail-invalid")
              .classList.remove("showError"),
          2000
        );
      } else {
        setSendingInformation(true);
        const result = await changeMail(
          user._id,
          user.username,
          data
        );
        if (result.error) {
          document
            .querySelector(".field_error-change-mail-in-use")
            .classList.add("showError");
          setTimeout(() => setSendingInformation(false), 1000);
          setTimeout(
            () =>
              document
                .querySelector(".field_error-change-mail-in-use")
                .classList.remove("showError"),
            2000
          );
        } else {
          dispatch(save(result.user))
          if (result.message.error) {
            swal({
              title: "Error",
              text: "Hubo un error al enviar el correo",
              icon: "error",
              timer: "2000",
              button: false,
            });
          } else {
            swal({
              title: "Enviado",
              text: "Revisa tu correo electrónico",
              icon: "success",
              timer: "2000",
              button: false,
            });
          }
          setSendingInformation(false);
        }
      }
    } else {
      document
        .querySelector(".field_error-change-mail")
        .classList.add("showError");
      setTimeout(
        () =>
          document
            .querySelector(".field_error-change-mail")
            .classList.remove("showError"),
        2000
      );
    }
  };

  return (
    <div className="check-email-container">
      {registration.validated === null ? (
        <Loading margin="auto" />
      ) : !registration.validated && registration.selection ? (
        <div className="check-email">
          <div className="check-email-header">
            <i className="fa fa-check"></i>
            <h1>REVISA TU EMAIL</h1>
          </div>
          <div className="check-email-main">
            <p className="sentEmail">
              Te hemos enviado un correo. Activa tu cuenta en el enlace
              proporcionado.
            </p>
            <div className="input-list-container">
              <h1>¿No recibiste nada?</h1>
              <div className="input-list">
                <p>
                  1. Si no encuentras el correo, mira a ver si está en otras
                  carpetas (spam, social, ...).
                </p>
                <div>
                  <p>2. ¿Escribiste bien el correo electrónico?</p>
                  <p
                    className="field field_error-change-mail-in-use"
                    style={{
                      textAlign: "center",
                      background: "#d10b0b",
                      padding: "6px",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  >
                    El correo está en uso.
                  </p>
                  <p
                    className="field field_error-change-mail-invalid"
                    style={{
                      textAlign: "center",
                      background: "#d10b0b",
                      padding: "6px",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  >
                    Escriba un correo válido.
                  </p>
                  <p
                    className="field field_error-change-mail"
                    style={{
                      textAlign: "center",
                      background: "#d10b0b",
                      padding: "6px",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  >
                    Escriba un correo electrónico diferente
                  </p>
                  <div className="check-email-change">
                    <input
                      type="email"
                      id="input-check-email"
                      placeholder="Correo electrónico"
                      onChange={(e) => setData(e.target.value)}
                    />
                    <button
                      style={{
                        background: sendingInformation ? "#3282B8" : "",
                        opacity: sendingInformation ? ".4" : "",
                        cursor: sendingInformation ? "not-allowed" : "",
                      }}
                      onClick={() => {
                        if (!sendingInformation) change();
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
                <p>
                  3. Espera unos 5 minutos. (dependiendo del correo esto puede
                  llevar unos segundos).
                </p>
                <p>
                  4. ¿No ha llegado nada? Por favor, contáctanos y explícanos el
                  problema{" "}
                  <Link className="check-email-link-help" to="/help">
                    Ayuda
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Navigate to="/" />
      )}
    </div>
  );
}

export default CheckEmail;
