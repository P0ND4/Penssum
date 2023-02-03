import InformationCard from "../../components/helpZone/InformationCard";

const Security = () => {
  return (
    <div className="commomStylePadding security-information">
      <InformationCard
        title="Seguridad"
        content="Al entrar a nuestra aplicación web te garantizamos que tu información estará totalmente cifrada, teniendo en cuenta que, de acuerdo a la privacidad de cada usuario, todas las secciones de la plataforma son seguras y privadas."
      />
      <div className="information-card-content">
        <h1>¿Como aportamos a tu seguirdad?</h1>
        <p>
          Tu seguridad al usar la plataforma es importante para nosotros, por lo
          que hemos implementado estrategias tendientes a proporcionarte una
          protección total durante su utilización. En tal sentido:
        </p>
        <ul>
          <li>Toda tu información está cifrada</li>
          <li>Todas las conversaciones que tengas son solo para ti</li>
          <li>
            Cualquier conducta inadecuada lo puedes reportar y nosotros
            actuaremos aplicando los correctivos necesarios
          </li>
          <li>
            Las transacciones que hagas por medio de la plataforma son seguras
          </li>
          <li>Te protegemos de enlaces maliciosos en nuestra aplicación</li>
          <li>La plataforma es 100% libre de virus</li>
          <li>
            Toda la información de los servicios es revisada antes de ser
            publicada para evitar malware
          </li>
        </ul>
      </div>
      <div className="information-card-content">
        <h1>Consejos de seguridad</h1>
        <p>
          La plataforma está diseñada para aportar a tu seguridad, pero como
          usuario debes evitar algunas acciones que pueden afectar la protección
          que te proporcionamos. Para ello, debes seguir las siguientes
          recomendaciones:
        </p>
        <ul>
          <li>No compartas tu ubicación exacta</li>
          <li>
            Si un usuario te pide descargar e instalar un programa, NO LO HAGAS
          </li>
          <li>
            SCuando acuerdes ver clases presenciales, hazlo acompañado de una
            persona de tu confianza e infórmale a tus familiares el lugar donde
            lo harás{" "}
          </li>
          <li>No compartas información privada</li>
        </ul>
        <p>
          Siguiendo estas recomendaciones, contribuirás a tu seguridad personal.
        </p>
      </div>
    </div>
  );
};

export default Security;