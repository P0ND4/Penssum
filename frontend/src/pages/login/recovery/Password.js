import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { changePassword, socket } from "../../../api";
import { save } from "../../../features/user/userSlice";
import { change } from "../../../features/user/authSlice";
import swal from "sweetalert";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function Password() {
  const {
    user: foundUserInformation,
    code,
    section,
  } = useSelector((state) => state.recovery);
  const [sendingInformation, setSendingInformation] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorContent, setErrorContent] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const passwordEvent = async () => {
    if (newPassword !== repeatPassword) {
      setErrorContent('Las contraseñas deben ser iguales');
      return setError(true);
    }

    if (/^.{6,30}$/.test(newPassword)) {
      setSendingInformation(true);
      const user = await changePassword({
        id: foundUserInformation._id,
        password: code,
        newPassword,
        isForgot: true,
      });
      dispatch(save(user));

      swal({
        title: "! EXITO !",
        text: "¡Contraseña cambiada con EXITO!",
        icon: "success",
        timer: "3000",
        button: false,
      }).then(() => {
        cookies.set("id", user._id, { path: "/" });
        socket.emit("connected", user._id);
        dispatch(change(true));
        navigate("/");
      });
    } else {
      setErrorContent(
        "Las contraseñas debe tener un mínimo de 6 caracteres y un máximo de 30 caracteres."
      );
      setError(true);
    };
  };

  return section === "password" ? (
    <div className="recovery-container">
      <form
        className="recovery"
        onSubmit={e => {
          e.preventDefault();
          if (!sendingInformation) passwordEvent();
        }}
      >
        <h3>Crea una nueva contraseña</h3>
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
            {errorContent}
          </p>
          <p>Introduce una nueva contraseña segura para tu cuenta.</p>
          <div className="form-control recovery-input-form">
            <input
              type="password"
              value={newPassword}
              placeholder="Nueva contraseña"
              onChange={(e) => {
                setError(false);
                setErrorContent("");
                setNewPassword(e.target.value);
              }}
            />
          </div>
          <div className="form-control recovery-input-form">
            <input
              type="password"
              value={repeatPassword}
              placeholder="Repite la contraseña"
              onChange={(e) => {
                setError(false);
                setErrorContent("");
                setRepeatPassword(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="account-recovery-button-container">
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
            id="accept-recovery"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  ) : (
    <Navigate to="/signin/recovery/email" />
  );
}

export default Password;
