import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, recoveryPassword } from "../../../api";
import { useDispatch, useSelector } from "react-redux";
import { save } from "../../../features/user/userSlice";
import { set } from "../../../features/registration/recoverySlice";

function Check() {
  const { email } = useSelector((state) => state.recovery);
  const [sendingInformation, setSendingInformation] = useState(false);
  const [error, setError] = useState(false);
  const [errorContent, setErrorContent] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const verifyEmail = async () => {
    if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(email)) {
      setSendingInformation(true);
      const result = await getUser({ email });

      if (result.error) {
        setErrorContent("El usuario no existe");
        setError(true);
        setSendingInformation(false);
      } else {
        dispatch(save(result));
        if (result.objetive === "") {
          navigate("/signup/selection");
        } else if (!result.validated) {
          navigate("/signup/check/email");
        } else {
          dispatch(set({ user: result }));
          const emailResult = await recoveryPassword({
            userInformation: result,
          });
          setSendingInformation(false);
          dispatch(set({ code: emailResult.code }));
          dispatch(set({ section: "check" }));
          navigate("/signin/recovery/check");
        }
      }
    } else {
      setErrorContent("Correo inválido");
      setError(true);
    }
  };

  return (
    <div className="recovery-container">
      <form
        className="recovery"
        onSubmit={(e) => {
          e.preventDefault();
          if (!sendingInformation) verifyEmail();
        }}
      >
        <h3>Recupera tu cuenta</h3>
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
          <p>Introduce tu correo electrónico para buscar tu cuenta.</p>
          <div className="form-control recovery-input-form">
            <input
              type="email"
              value={email}
              placeholder="Correo electrónico"
              onChange={(e) => {
                setError(false);
                setErrorContent("");
                dispatch(set({ email: e.target.value.trim() }));
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
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Check;