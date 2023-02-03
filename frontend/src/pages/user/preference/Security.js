import SecurityPreference from "../../../components/user/SecurityPreference";

function Security() {
  return (
    <div className="commomStylePadding">
      <div className="login-security-container">
        <h1>Inicio de sesión</h1>
        <hr />
        <div className="login-security-zone">
          <SecurityPreference
            property="Cambiar contraseña"
            i="fab fa-keycdn"
            description="Elige una contraseña segura que solo tú sepas."
            id="edit-password"
            securityType="password"
          />
          {/*<SecurityPreference property="Guardar informacion de incio de sesion" i="fas fa-id-card" span="Activado" description="Guarda el inicio de sesión en tu cuenta para que, no tengas que copiar la contraseña y el correo al iniciar la plataforma." id="edit-first-name" /> */}
        </div>
      </div>
    </div>
  );
}

export default Security;
