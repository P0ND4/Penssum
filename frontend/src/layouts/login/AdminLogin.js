import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAdminInformation } from "../../api";
import { active } from "../../features/dashboard/validatedSlice";
import { adminParticles } from "../../settings";
import Particles from "react-tsparticles";

function AdminLogin() {
  const signIn = useSelector((state) => state.signIn);

  const [fieldsError, setFieldsError] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState({ email: "", password: "", keyword: "" });
  const [sendingInformation, setSendingInformation] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = async () => {
    setFieldsError(false);
    setError(false);

    if (data.email === "" || data.password === "" || data.keyword === "")
      setFieldsError(true);
    else {
      setSendingInformation(true);
      const checkInformation = await checkAdminInformation({
        security: 2,
        data,
      });
      setSendingInformation(false);
      if (!checkInformation.error) {
        await dispatch(active());
        navigate("/dashboard/general");
      } else setError(true);
    }
  };

  return signIn ? (
    <div className="signin-admin-container">
      <Particles id="tsparticles" options={adminParticles} />
      <div className="signin-admin-card">
        <div className="signin-admin-card-title">
          <h1>ADMINISTRADOR</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!sendingInformation) validate();
          }}
        >
          {error && (
            <p
              className="field"
              style={{
                display: "block",
                textAlign: "center",
                background: "#d10b0b",
                padding: "6px",
                borderRadius: "8px",
                color: "#FFFFFF",
              }}
            >
              Correo o contraseña inválida
            </p>
          )}
          <div className="form-container">
            <div className="form-control">
              <input
                type="email"
                placeholder="Correo"
                name="email"
                onChange={(e) =>
                  setData({ ...data, email: e.target.value.trim() })
                }
                autoComplete="off"
              />
            </div>
            <div className="form-control">
              <input
                type="password"
                placeholder="Contraseña"
                name="password"
                onChange={(e) => setData({ ...data, password: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="form-control">
              <input
                type="text"
                placeholder="Palabra clave"
                name="keyword"
                onChange={(e) =>
                  setData({ ...data, keyword: e.target.value.trim() })
                }
                autoComplete="off"
              />
            </div>
          </div>
          {/*<p className="attempts-available">Intentos disponibles: <span>3</span></p>*/}
          {fieldsError && (
            <p className="field" style={{ display: "block" }}>
              Rellene todos los campos.
            </p>
          )}
          <div className="form-control">
            <button
              id="signin-admin-button"
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <Navigate to="/signin" />
  );
}

export default AdminLogin;