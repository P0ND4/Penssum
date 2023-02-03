import React from "react";

function Form({
  errors,
  error,
  register,
  sendingInformation,
  passwordRepeat,
  setPasswordRepeat,
}) {
  return (
    <>
      <div className="form-grid">
        <div className="form-control">
          <input
            type="text"
            placeholder="Nombre (opcional)"
            {...register("firstName", {
              pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{0,16}$/,
            })}
            aria-invalid={errors.firstName ? "true" : "false"}
          />
          {errors.firstName?.type && (
            <p className="field" style={{ display: "block" }}>
              El nombre no puede superar los 16 caracteres, no debe tener
              símbolos o números.
            </p>
          )}
        </div>
        <div className="form-control">
          <input
            type="text"
            placeholder="Apellido (opcional)"
            {...register("lastName", {
              pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{0,16}$/,
            })}
            aria-invalid={errors.lastName ? "true" : "false"}
          />
          {errors.lastName?.type && (
            <p className="field" style={{ display: "block" }}>
              El apellido no puede superar los 16 caracteres, no debe tener
              símbolos o números.
            </p>
          )}
        </div>
        <div className="form-control">
          <input
            type="text"
            placeholder="Nombre de usuario"
            {...register("username", {
              required: true,
              pattern: /^[a-zA-Z0-9_.-]{3,16}$/,
            })}
            aria-invalid={errors.username ? "true" : "false"}
          />
          {errors.username?.type && (
            <p className="field" style={{ display: "block" }}>
              El nombre de usuario no puede superar los 16 caracteres ni ser
              menor a 3 caracteres tampoco puede colocar símbolos extraños.
            </p>
          )}
          {error.includes("user_exists") && (
            <p className="field" style={{ display: "block" }}>
              El nombre de usuario ya existe.
            </p>
          )}
        </div>
        <div className="form-control">
          <input
            type="email"
            placeholder="Correo electrónico"
            {...register("email", {
              required: true,
              pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/,
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email?.type && (
            <p className="field" style={{ display: "block" }}>
              Correo requerido.
            </p>
          )}
          {errors.email?.type && (
            <p className="field" style={{ display: "block" }}>
              Correo invalidó.
            </p>
          )}
          {error.includes("email_exists") && (
            <p className="field" style={{ display: "block" }}>
              El correo está en uso.
            </p>
          )}
        </div>
        <div className="form-control">
          <input
            type="password"
            placeholder="Contraseña"
            {...register("password", {
              required: true,
              pattern: /^.{6,30}$/,
            })}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password?.type && (
            <p className="field" style={{ display: "block" }}>
              La contraseña no debe tener menos de 6 caracteres ni superar los
              30 caracteres.
            </p>
          )}
        </div>
        <div className="form-control">
          <input
            type="password"
            placeholder="Repite la contraseña"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
          />
          {error.includes("repeatPassword") && (
            <p className="field" style={{ display: "block" }}>
              Las contraseña deben ser iguales.
            </p>
          )}
        </div>
      </div>
      <div className="form-control">
        <button
          id="signup-button"
          style={{
            background: sendingInformation ? "#3282B8" : "",
            opacity: sendingInformation ? ".4" : "",
            cursor: sendingInformation ? "not-allowed" : "",
          }}
        >
          REGISTRARSE
        </button>
      </div>
    </>
  );
}

export default Form;
