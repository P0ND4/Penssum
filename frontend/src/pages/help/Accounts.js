import { Link } from "react-router-dom";
import InformationCard from "../../components/helpZone/InformationCard";

const Accounts = () => {
  return (
    <div className="commomStylePadding accounts-information">
      <InformationCard
        title="Cuentas"
        content="En nuestra aplicación web te puedes registrar en dos cuentas diferentes: la cuenta de profesor y la cuenta de alumno. Al registrarte como profesor, podrás publicar tus enseñanzas y ofrecer tus servicios en tal sentido; al registrarte como cliente puedes pedir los servicios que necesites y ofertar a los servicios ofrecidos por los profesores. Si tienes una tarea que no comprendes claramente, puedes publicar un servicio para obtener la ayuda que necesites."
      />

      <InformationCard
        title="Configuración de la cuenta"
        content="La configuración de la cuenta no es tan compleja: si tienes la sesión iniciada debes ubicar la barra de navegación de tu cuenta y seleccionar PREFERENCIAS, una vez que hayas ingresado, tendrás la libertad de decidir que vas a hacer con tu cuenta, y podrás personalizarla a tu gusto. Si quieres cambiar tu foto de perfil y/o de portada, podrás hacerlo navegando hacia la sección de tu perfil y seleccionando el icono de un lápiz sobre la imagen que desees cambiar."
      />

      <div className="information-card-content">
        <h1>Información requerida</h1>
        <p>
          Para usar tu cuenta con libertad, deberás diligenciar una información
          básica, la cual es utilizada para hacer una breve descripción tuya,
          para identificar quien eres, lo que facilita la búsqueda entre alumnos
          y profesores; se trata de generarte un perfil que permita tu rápida
          identificación dentro de la plataforma. Para la configuración de su
          cuenta, el alumno debe aportar la siguiente información:
        </p>
        <ul>
          <li>Primer nombre</li>
          <li>Primer Apellido</li>
          <li>Descripción</li>
          <li>Número de teléfono</li>
        </ul>

        <p>
          Para la configuración de su cuenta, el profesor debe aportar la
          siguiente información:
        </p>
        <ul>
          <li>Primer nombre</li>
          <li>Segundo nombre</li>
          <li>Primer apellido</li>
          <li>Segundo Apellido</li>
          <li>Descripción</li>
          <li>Cedula de ciudadanía</li>
          <li>Número de teléfono</li>
          <li>Ciudad donde reside</li>
        </ul>
        <p>
          Al hacer la configuración de tu cuenta, te ayudaremos a identificar el
          campo obligatorio con este ícono{" "}
          <i
            className="fa-solid fa-circle-exclamation field-required-icon"
            style={{ position: "initial", top: 0, left: 0 }}
            title="Campo requerido"
          ></i>{" "}
          en la configuracion de tu cuenta.
        </p>
        <br />
        <br />
        <Link to="/preference/mod=general" style={{ color: "#3282B8" }}>
          Ir a la configuracion de mi cuenta
        </Link>
      </div>

      <div className="information-card-content">
        <h1>Sanciones por mal uso de la cuenta</h1>
        <p>
          Existen 3 tipos de sanciones que pueden ser aplicadas cuando un
          usuario le da mal uso a su cuenta:
        </p>
        <ul>
          <li>Advertencia a través de la plataforma</li>
          <li>Suspensión temporal de la cuenta</li>
          <li>Bloqueo permanente de la cuenta</li>
        </ul>
        <p>
          Estas sanciones tienen como propósito principal garantizarle a
          nuestros usuarios la protección que requieren para utilizar la
          aplicación con absoluta confianza y dentro de un entorno seguro. A
          continuación, te explicamos las causas de cada una de dichas
          sanciones:
        </p>
        <br />
        <br />
        <p>
          <b>Advertencia a través de la plataforma</b>: e origina por
          violaciones menores, tales como reclamos de usuarios a su cuenta, no
          asistir a una clase por videollamada, emplear palabras ofensivas,
          entre otras. La repetición de la misma advertencia podría conducir a
          la suspensión temporal de la cuenta.
        </p>
        <br />
        <br />
        <p>
          <b>Suspensión temporal de la cuenta</b>: ediante esta medida, la
          cuenta puede ser suspendida por un periodo de tiempo determinado.
          Tiene ocurrencia por violaciones medianas por parte del usuario que
          resulten en repeticiones de advertencias, en la utilización de
          imágenes no adecuadas durante los servicios, entre otros. El tiempo
          estimado para que la cuenta pueda ser desbloqueada dependerá de la
          gravedad de las violaciones a las reglas de la plataforma. El usuario
          debe tener en cuenta que nuestro sistema de funcionamiento está basado
          en los principios de tolerancia y respeto, lo que garantiza un grado
          de flexibilidad al momento de valorar las faltas, pero ante la
          repetición de las mismas violaciones, el tiempo de espera podría ser
          mucho mayor.
        </p>
        <br />
        <br />
        <p>
          <b>Bloqueo permanente de la cuenta</b>: Esta es la máxima sanción que
          se puede aplicar a un usuario, la cual resulta de violaciones mayores
          a las reglas de nuestra plataforma, como, por ejemplo: realizar
          amenazas o extorsionar a otros usuarios, ofrecer falsos servicios,
          utilizar o publicar links engañosos con contenido pornográfico,
          introducir virus u otros programas que amenacen o rompan con las
          buenas costumbres que sirven de base a nuestra aplicación. Cuando se
          imponga esta sanción, el bloqueo de la cuenta será permanente y el
          usuario no podrá volver a registrarse. En aplicación del derecho de
          defensa y del debido proceso, de acuerdo a los datos guardados en la
          base de datos, el usuario tendrá la oportunidad de defenderse
          exponiendo los argumentos que considere necesarios. Si sus
          argumentaciones carecen de sentido y no logran desvirtuar la falta, se
          procederá a su bloqueo permanente en la aplicación.
        </p>
        <br />
        <br />
        <p>
          Si sigues las normas, reglas y políticas de privacidad de forma
          correcta, no recibirías ningún llamado de atención. El objetivo de
          Penssum es brindarte la mejor experiencia, evitándote cualquier tipo
          de inconvenientes con otros usuarios que no respetan nuestras reglas,
          basadas en las buenas costumbres.
        </p>
      </div>
      <InformationCard
        title="Bloquear o reportar cuenta"
        content="Si tienes inconvenientes con un usuario que te envíe palabras ofensivas a través de mensajes, si eres objeto de discriminación, de abuso verbal, entre otros, puedes bloquear, denunciar o reportar la cuenta. Si llegaras a bloquearla, la conversación terminará y no te podrá escribir más, no podrá tener acceso a la vista de tu perfil, número de teléfono, información personal ni a los servicios que prestes. Puedes decidir si quieres tener contacto con un usuario bloqueándolo y desbloqueándolo cuando lo consideres prudente. Si tu interés es, denunciar o reportar su cuenta, debes seleccionar la causa que te lo permitiría y con previa comunicación, lo podrás bloquear. La plataforma se encargará de revisar las conversaciones que hayas tenido con el usuario, para tomar las medidas correctivas respecto a este.
                                        La denuncia o reporte se recomienda si te escriben para extorsionarte, si se presenta abuso verbal en tu contra, si te solicitan o envían contenido obsceno, entre otras situaciones que consideres lesivas para tus intereses. Si, al revisar tu caso, advertimos que la denuncia o reporte no corresponde a la realidad o los argumentos presentados son falsos, la consecuencia podría ser la suspensión temporal de tu cuenta, o una advertencia por medio de la plataforma. Si un usuario te bloquea para evadirte o porque no te quiere pagar o por cualquier otro asunto, comunícate con nosotros, a fin de que tomemos las medidas necesarias para resolver la situación. "
      />
    </div>
  );
};

export default Accounts;
