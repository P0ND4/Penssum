import { useState, useEffect } from "react";
import ContactForm from "../parts/helpZone/ContactForm";
import HelpCard from "../parts/helpZone/HelpCard";

function Help({ obtainedFiles, setObtainedFiles, auth }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    isOpen
      ? (document.querySelector("body").style.overflow = "hidden")
      : (document.querySelector("body").style.overflow = "auto");
  });

  return (
    <div className="help-container">
      <div className="help">
        <h1 className="help-title">¿CÓMO PODEMOS AYUDARTE?</h1>
        <div className="help-card-container">
          <HelpCard
            element="Link"
            src="/img/illustration/help-information.svg"
            alt="help-information"
            h1="Buscar información"
            p="Busca información del uso de Penssum."
          />
          {auth && (
            <HelpCard
              idDark="dark-help-information"
              element="section"
              src="/img/illustration/contact_us.svg"
              alt="contact_us"
              h1="Contáctanos para información avanzada"
              p="Busca información avanzada del uso de Penssum, ponte en contacto con nosotros."
              setIsOpen={setIsOpen}
            />
          )}
          {auth && (
            <HelpCard
              idDark="dark-report-error"
              element="section"
              src="/img/illustration/report-bug-error.svg"
              alt="report-bug-error"
              h1="Reporta un problema"
              p="¿Encontraste un error o un bug? Repórtalo para solucionarlo."
              setIsOpen={setIsOpen}
            />
          )}
        </div>
      </div>
      {auth && (
        <div className="dark-container-help">
          <ContactForm
            id="dark-help-information"
            title="Buscar información"
            description="Si necesitas ayuda del uso de Penssum que no aparezca en el panel de información,  puedes preguntarnos a través de este formulario, su mensaje  será respondido en las próximas 24 horas."
            placeholder="Tema principal"
            idTextarea="description-help-information"
            textareaPlaceholder="¿En que podemos ayudarte?"
            dataValue="Opcional"
            idInput="search-file-for-help-information"
            obtainedFiles={obtainedFiles}
            setObtainedFiles={setObtainedFiles}
            setIsOpen={setIsOpen}
          />
          <ContactForm
            id="dark-report-error"
            title="Reportar error o bug"
            description="¿Tienes un error al usar nuestra aplicación? 
                        No dudes en avisarnos para reparar los errores que puedas 
                        encontrar en nuestra página, se te agradecería mucho, 
                        departe de los administradores."
            placeholder="Escriba la zona afectada"
            idTextarea="description-report-error"
            textareaPlaceholder="¿Cuál fue el problema? Escribe con detalle que paso."
            dataValue="Recomendado"
            idInput="search-file-for-report-error"
            obtainedFiles={obtainedFiles}
            setObtainedFiles={setObtainedFiles}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
    </div>
  );
}

export default Help;
