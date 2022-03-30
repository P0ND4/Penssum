import ContactForm from '../parts/helpZone/ContactForm';
import HelpCard from "../parts/helpZone/HelpCard";

function Help() {
    return (
        <div className="help-container">
            <div className="help">
                <h1 className="help-title">¿COMO PODEMOS AYUDARTE?</h1>
                <div className="help-card-container">
                    <HelpCard element="Link" src="/img/illustration/help-information.svg" alt="help-information" h1="Buscar informacion" p="Busca informacion del uso de Protech." />
                    <HelpCard idDark="dark-help-information" element="section" src="/img/illustration/contact_us.svg" alt="contact_us" h1="Contactanos para informacion avanzada" p="Busca informacion avanzada del uso de Protech, ponte en contacto con nosotros." />
                    <HelpCard idDark="dark-report-error" element="section" src="/img/illustration/report-bug-error.svg" alt="report-bug-error" h1="Reporta un problema" p="Encontraste un error o un bug? reportalo para solucionarlo." />
                </div>
            </div>
            <div className="dark-container-help">
                <ContactForm id="dark-help-information" title="Buscar informacion" description="Si necesitas ayuda del uso de Protech que no aparezca en el panel de informacion, puedes preguntarnos a traves de este formulario, su mensaje sera respondido en las proximas 24 horas." placeholder="Tema principal" idTextarea="description-help-information" textareaPlaceholder="¿En que podemos ayudarte?" dataValue="Opcional" idInput="search-file-for-help-information"/>
                <ContactForm id="dark-report-error" title="Reportar error o bug" description="¿Tienes un error al usar nuestra aplicacion? no dudes en avisarnos para reparar los errores que puedas encontrar en nuestra pagina, se te agradeceria mucho, departe de los administradores." placeholder="Escriba la zona afectada" idTextarea="description-report-error" textareaPlaceholder="¿Cual fue el problema? escribe con detalle que paso." dataValue="Recomendado" idInput="search-file-for-report-error"/>
            </div>
        </div>
    );
};

export default Help;