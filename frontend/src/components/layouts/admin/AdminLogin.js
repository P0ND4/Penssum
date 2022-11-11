import { useState } from "react";
import { checkAdminInformation } from "../../../api";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";

function AdminLogin({ setDashboard }) {
  const [data, setData] = useState({
    email: "",
    password: "",
    keyword: "",
  });
  const [sendingInformation, setSendingInformation] = useState(false);

  const navigate = useNavigate();

  const validate = async () => {
    document.querySelector(".login_error_admin").classList.remove("showError");
    document
      .querySelector(".field_error_fill_field")
      .classList.remove("showError");

    if (data.email === "" || data.password === "" || data.keyword === "") {
      document
        .querySelector(".field_error_fill_field")
        .classList.add("showError");
    } else {
      setSendingInformation(true);
      const checkInformation = await checkAdminInformation({
        security: 2,
        data,
      });
      setSendingInformation(false);

      if (!checkInformation.error) {
        setDashboard(true);
        navigate("/dashboard/mod=general");
      } else {
        document.querySelector(".login_error_admin").classList.add("showError");
      }
    }
  };

  return (
    <div className="signin-admin-container">
      <Particles
        id="tsparticles"
        options={{
          fpsLimit: 120,
          particles: {
            color: { value: "#ffffff" },
            collisions: { enable: true },
            move: {
              direction: "none",
              enable: true,
              outMode: "bounce",
              random: true,
              speed: 0.8,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 100,
            },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: {
              random: true,
              value: 6,
            },
          },
          detectRetina: true,
        }}
      />
      <div className="signin-admin-card">
        <div className="signin-admin-card-title">
          <h1>ADMINISTRADOR</h1>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <p
            className="field login_error_admin"
            style={{
              textAlign: "center",
              background: "#d10b0b",
              padding: "6px",
              borderRadius: "8px",
              color: "#FFFFFF",
            }}
          >
            Correo o contraseña inválida
          </p>
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
          <p className="field field_error_fill_field">
            Rellene todos los campos.
          </p>
          <div className="form-control">
            <button
              id="signin-admin-button"
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
              onClick={() => {
                if (!sendingInformation) validate();
              }}
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
