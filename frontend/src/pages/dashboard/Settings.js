import { useSelector } from "react-redux";
import DashboardPreferencePart from "../../components/dashboard/DashboardPreferencePart";
import DashboardPasswordPart from "../../components/dashboard/DashboardPasswordPart";

function Settings() {
  const information = useSelector((state) => state.dashboardInformation);

  return (
    <div className="commomStylePadding">
      <DashboardPreferencePart
        name="name"
        property="Nombre"
        value={information !== null ? information.name : ""}
        id="name"
        idInput="name-dashboard-preference"
        inputType="text"
        placeholder="¿Cómo quiere que lo llamemos?"
      />
      <DashboardPreferencePart
        name="firstEmail"
        property="Primer correo"
        value={information !== null ? information.firstEmail : ""}
        id="firstEmail"
        idInput="firstEmail-dashboard-preference"
        inputType="email"
        placeholder="Escriba el nuevo correo principal"
      />
      <DashboardPasswordPart
        property="Cambiar contraseña principal"
        i="fab fa-keycdn"
        description="Elige una contraseña principal segura para que puedas entrar desde el login."
        id="edit-password"
        typePassword={1}
      />
      <DashboardPreferencePart
        name="secondEmail"
        property="Segundo correo"
        value={information !== null ? information.secondEmail : ""}
        id="secondEmail"
        idInput="secondEmail-dashboard-preference"
        inputType="email"
        placeholder="Escriba el nuevo correo segundario"
      />
      <DashboardPasswordPart
        property="Cambiar contraseña segundaria"
        i="fab fa-keycdn"
        description="Elige una contraseña segundaria segura para que puedas entrar en la segunda capa de seguridad."
        id="edit-password"
        typePassword={2}
      />
      <DashboardPreferencePart
        name="keyword"
        property="Palabra clave"
        value={information !== null ? information.keyword : ""}
        id="keyword"
        idInput="keyword-dashboard-preference"
        inputType="text"
        placeholder="Escriba la nueva palabra clave"
      />
    </div>
  );
}

export default Settings;
