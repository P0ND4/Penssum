import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { set } from "../../../features/registration/recoverySlice";
import swal from "sweetalert";

function Email() {
  const { email, code, section } = useSelector((state) => state.recovery);

  const [sendingInformation, setSendingInformation] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const verifyCode = () => {
    setSendingInformation(true);

    if (inputCode === code) {
      setSendingInformation(false);
      dispatch(set({ section: "password" }));
      navigate("/signin/recovery/password");
    } else {
      setErrorCount(errorCount + 1);
      if (errorCount === 5) {
        swal({
          title: "Error",
          text: "Máximo de intento superado.",
          icon: "error",
          timer: "3000",
          button: false,
        }).then(() => navigate("/signin"));
      } else setError(true);
    }

    setTimeout(() => setSendingInformation(false), 400);
  };

  return section === "check" ? (
    <div className="recovery-container">
      <form
        className="recovery"
        onSubmit={e => {
          e.preventDefault();
          if (!sendingInformation) verifyCode();
        }}
      >
        <h3>Ingresa el código de seguridad</h3>
        <div className="account-recovery-description">
          <p
            className="field"
            style={{
              textAlign: "center",
              background: "#d10b0b",
              padding: "6px",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "16px",
              display: error ? "block" : "",
            }}
          >
            Código incorrecto.
          </p>
          <p>
            Comprueba si recibiste un correo electrónico con tu código de 6
            dígitos.
          </p>
          <div className="form-control recovery-input-code-form">
            <input
              type="number"
              value={inputCode}
              placeholder="Codigo"
              onChange={(e) => {
                setError(false);
                setInputCode(e.target.value.trim());
              }}
            />
            <p>
              Enviamos el código a: <br /> {email}
            </p>
          </div>
        </div>
        <div className="account-recovery-code-button-container">
          <p onClick={() => navigate("/signin/recovery/email")}>
            ¿No recibiste el correo?
          </p>
          <div className="account-recovery-code-button">
            <button id="cancel-recovery">
              <Link
                to="/signin"
                className="cancel-recovery-link"
                style={{ textDecoration: "none" }}
              >
                Cancelar
              </Link>
            </button>
            <button
              id="verify-code"
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      </form>
    </div>
  ) : (
    <Navigate to="/signin/recovery/email" />
  );
}

export default Email;
