import { useSelector } from "react-redux";
import PreferenceToggle from "../../../components/user/PreferenceToggle";

function Privacy() {
  const user = useSelector(state => state.user);

  return (
    <div className="commomStylePadding">
      <PreferenceToggle
        idButton="phone-button-toggle"
        idContainer="button-toggle-phone"
        h4="Quien puede ver tu número de teléfono"
        p="Esto es para facilitar el contacto a través de la plataforma, los usuarios podrán ver su número de teléfono desde su perfil."
        name="showMyNumber"
        value={user.showMyNumber}
      />
    </div>
  );
};

export default Privacy;
