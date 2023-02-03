import { Link } from "react-router-dom";
import InformationCard from "../../components/helpZone/InformationCard";

const Publications = () => {
  return (
    <div className="commomStylePadding product-help-information">
      <InformationCard
        title="Servicio o actividad"
        content="En nuestra aplicación el principal enfoque es el comercio electrónico. Este se materializa a través de un servicio que puedas prestar o de una actividad que desees realizar. Así, como profesor, puedes dar clases de matemáticas, dictar cursos, etc; mientras que, como alumno, puedes recibir ayuda en las tareas requieras, por ejemplo, si se trata de una  tarea de algebra puedes publicar tu actividad como: `necesito ayuda en algebra`. Este es el enfoque principal de nuestra plataforma, a través de la cual, buscamos agregar usuarios dos tipos de usuarios: a) profesores puedan apoyar o guiar a quienes lo necesiten y, b) alumnos que requieran de apoyo u orientación en los temas que ofrecen nuestros profesores.
                                            Lo que destaca a Penssum como una plataforma de comercio electrónico es que, al usarla, el usuario tiene la posibilidad de hacer una oferta por un servicio o una actividad y si no cuenta con la suma establecida, puede hacer una contra oferta, indicando de cuanto dinero dispone para tal servicio o actividad y el profesor/alumno decidirá si acepta la oferta o le responde con otra propuesta económica."
      />
      <InformationCard
        title="¿Cómo publicar un servicio o actividad?"
        content="Para publicar un servicio o una actividad, se necesitará que el usuario esté registrado en la plataforma, previo cumplimiento de los requisitos exigidos para su aceptación. Cada tipo de cuenta en las categorías de PROFESOR o ALUMNO, tiene unos requisitos de obligatorio cumplimiento. La información que necesitas para llenar estos requisitos aparecerá indicada en la sección de tu perfil advirtiéndote: `necesitas rellenar los siguientes requisitos para poder publicar tus productos o actividad`. Una vez completado lo pedido, podrás publicar tus servicios y mostrarle al mundo lo que ofreces."
      />
      <InformationCard
        title="Revisión del servicio o actividad"
        content="Una vez finalizada la creación del servicio o actividad será enviada a revisión, este proceso dura máximo 24 horas. En este trámite de revisión, se validará si la descripción, las categorías personalizadas y las imágenes son acordes al contenido colocado, esto es para evitar cualquier contenido pornográfico, obsceno, grosero o ilegal. Cualquier contenido inadecuado se penalizará de acuerdo a la gravedad de la violación respecto a los términos y condiciones de uso de Penssum."
      />
      <InformationCard
        title="Ver ofertas recibidas en mis servicios o actividad"
        content="Si quieres ver las ofertas que has tenido puedes entrar al servicio o actividad de tu pertenencia, donde debe aparecer la opción *Ver ofertas recibidas*, a la cual solo tú tienes acceso. Una vez que ingreses, visualizarás el nombre de los usuarios que han ofertado."
      />
      <InformationCard
        title="Opciones de ofertas en los servicios o actividad"
        content="Cuando hayas visualizado las ofertas de tus productos, aparecerán los nombres de los usuarios que han ofertado y, al lado de sus nombres, aparecerán cuatro opciones, así: la primera es el mensaje, a través del cual  puedes  comunicarte con el usuario a través de la plataforma; la segunda te permite responder con una contraoferta, si quieres subir un poco el precio de lo ofertado lo puedes hacer; la tercera te da la posibilidad de denegar la oferta, caso en el cual, el usuario denegado recibirá una notificación en la que se le informará que su oferta no fue aceptada y la cuarta opción es la de aceptar oferta. SI aceptas la oferta se le notificará al usuario aceptado por correo que su oferta ha sido aceptada. Luego de la notificación al usuario aceptado, este y el oferente, podrán hablar por mensaje, según su preferencia, para concretar el servicio."
      />
      <div className="information-card-content">
        <h1>Como coordinar la clase</h1>
        <p>
          Normalmente, para coordinar una clase, el alumno tendrá que hablar con
          el profesor y este decidirá como va a hacer la implementación de la
          clase, en este caso, si es por medio de esta plataforma o si lo hará
          en un salón de clases del que disponga, o si tiene ambas opciones.
          Recuerda, si te vas a reunir presencialmente con el profesor, toma las
          prevenciones de seguridad recomendadas,{" "}
          <Link to="/help/information/mod=security" className="help-nav-link">
            Conoce más de seguridad
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Publications;
