import { useEffect } from 'react';
import { useParams } from 'react-router';
import { Link, Navigate } from 'react-router-dom';

import InformationCard from './InformationCard';

function HelpInformation() {
    const { attribute } = useParams();

    useEffect(() => {
        document.querySelectorAll('.helpInformation-sections').forEach(section => section.classList.remove('helpInformation-active'));
        if (window.screen.width <= 600) document.querySelector('.helpInformation-sections-container').classList.add('helpInformation-sections-container-in-mobile');
        else document.querySelector('.helpInformation-sections-container').classList.remove('helpInformation-sections-container-in-mobile');
        
        if (attribute === 'mod=penssum') document.querySelector('.penssum-link').classList.add('helpInformation-active');
        if (attribute === 'mod=security') document.querySelector('.security-help-link').classList.add('helpInformation-active');
        if (attribute === 'mod=accounts') document.querySelector('.accounts-help-link').classList.add('helpInformation-active');
        if (attribute === 'mod=products') document.querySelector('.products-help-link').classList.add('helpInformation-active');
        //if (attribute === 'mod=call_video') document.querySelector('.call_video-help-link').classList.add('helpInformation-active');
        if (attribute === 'mod=frequent_questions') document.querySelector('.frequent_questions-help-link').classList.add('helpInformation-active');
        if (attribute === 'mod=terms_and_conditions') document.querySelector('.terms_and_conditions-help-link').classList.add('helpInformation-active');
    });

    return (
        <div className="helpInformation-container">
            <div className="helpInformation-sections-container">
                <h1 className="helpInformation-sections-title">Informacion</h1>
                <hr />
                <Link to="/help/information/mod=penssum" className="helpInformation-sections penssum-link">
                    <i className="fas fa-cog"></i>
                    <p>Penssum</p>
                </Link>
                <Link to="/help/information/mod=security" className="helpInformation-sections security-help-link">
                    <i className="fas fa-shield-alt"></i>
                    <p>Seguridad</p>
                </Link>
                <Link to="/help/information/mod=accounts" className="helpInformation-sections accounts-help-link">
                    <i className="fas fa-users"></i>
                    <p>Cuentas</p>
                </Link>
                <Link to="/help/information/mod=products" className="helpInformation-sections products-help-link">
                    <i className="fas fa-store-alt"></i>
                    <p>Servicios</p>
                </Link>
                {/*<Link to="/help/information/mod=call_video" className="helpInformation-sections call_video-help-link">
                    <i className="fas fa-video"></i>
                    <p>Videollamadas</p>
                </Link>*/}
                <hr/>
                <Link to="/help/information/mod=frequent_questions" className="helpInformation-sections frequent_questions-help-link">
                    <i className="far fa-question-circle"></i>
                    <p>Preguntas frecuentes</p>
                </Link>
                <Link to="/help/information/mod=terms_and_conditions" className="helpInformation-sections terms_and_conditions-help-link">
                    <i className="fas fa-book"></i>
                    <p>Términos y condiciones</p>
                </Link>
            </div>
            <div className="main-helpInformation-section">
                <i className="fas fa-chevron-left" id="fa-chevron-left-helpInformation" onClick={() => document.querySelector('.helpInformation-sections-container').classList.remove('helpInformation-sections-container-in-mobile')}></i>
                {attribute === 'mod=penssum'
                    ?   <div className="commomStylePadding protech">
                            <InformationCard 
                                title="Penssum" 
                                content="Penssum es una plataforma de asistencia académica que permite a los estudiantes conectarse con los mejores docentes en soluciones inmediatas a las actividades diarias curriculares más exigentes, es el mejor aliado estratégico para fortalecer y obtener conocimientos y las mejores calificaciones de una manera fácil ágil y segura." 
                                />
                            <InformationCard 
                                title="¿Porque elegirnos?" 
                                content="Somos la única plataforma que te da la oportunidad de hacer ofertas a los profesores/alumnos desde la misma web, teniendo contacto directo, sin ningún tipo de prohibición en cuanto a la comunicación fuera de la aplicación web y con la posibilidad de contar con un chat desde tu propio perfil; pudiendo comunicarte sin ningún problema con otros usuarios. Adicionalmente, tienes la opción de denunciar y bloquear usuarios para evitar malos entendidos e inconvenientes. 
                                Además, los servicios de profesores tienen la opción de programar una videollamada para contar con un salón de clases desde la misma web. La aplicación brinda atención al cliente las 24 horas del día, de forma que si llegaras a tener algún inconveniente o problema, tendrías la posibilidad de comunicarte con nosotros desde el panel de navegación de su perfil, a fin buscar la solución al mismo." 
                                />
                            <div className="information-card-content">
                                <h1>Ventajas de usar Penssum</h1>
                                <p>Las principales ventajas de usar nuestra plataforma son las siguientes: </p>
                                <ul>
                                    <li>Seguridad 100% garantizada</li>
                                    <li>Publicación de servicio rompiendo record en velocidad</li>
                                    <li>Los mejores precios del mercado</li>
                                    <li>Posibilidad de ofertas y contraoferta</li>
                                    <li>Comunicación dentro de la aplicación</li>
                                    <li>Libertad de comunicación fuera de la plataforma</li>
                                    <li>Atención al cliente las 24 horas</li>
                                    <li>Prohibición de servicios o contenidos obscenos en nuestra aplicación</li>
                                    <li>Fácil navegabilidad</li>
                                    <li>Configuración de tu perfil</li>
                                    <li>Acceso a videollamadas</li>
                                    <li>Registro sencillo con validación</li>
                                    <li>Registro como alumno y profesor</li>
                                    <li>Elección de materias y temas</li>
                                    <li>Barra de búsqueda en tiempo real</li>
                                    <li>Uso confiable de nuestra plataforma</li>
                                </ul>
                                <p>En Penssum buscamos asegurarte la mejor experiencia que puedas tener como usuario.</p>
                            </div>
                        </div> 
                    : attribute === 'mod=security'
                        ?   <div className="commomStylePadding security-information">
                                <InformationCard 
                                    title="Seguridad" 
                                    content="Al entrar a nuestra aplicación web te garantizamos que tu información estará totalmente cifrada, teniendo en cuenta que, de acuerdo a la privacidad de cada usuario, todas las secciones de la plataforma son seguras y privadas." 
                                />
                                <div className="information-card-content">
                                    <h1>¿Como aportamos a tu seguirdad?</h1>
                                    <p>
                                        Tu seguridad al usar la plataforma es importante para nosotros, por lo que hemos implementado estrategias tendientes a proporcionarte una protección total durante su utilización. En tal sentido:
                                    </p>
                                    <ul>
                                        <li>Toda tu información está cifrada</li>
                                        <li>Todas las conversaciones que tengas son solo para ti</li>
                                        <li>Cualquier conducta inadecuada lo puedes reportar y nosotros actuaremos aplicando los correctivos necesarios</li>
                                        <li>Las transacciones que hagas por medio de la plataforma son seguras</li>
                                        <li>Te protegemos de enlaces maliciosos en nuestra aplicación</li>
                                        <li>La plataforma es 100% libre de virus</li>
                                        <li>Toda la información de los servicios es revisada antes de ser publicada para evitar malware</li>
                                    </ul>
                                </div>
                                <div className="information-card-content">
                                    <h1>Consejos de seguridad</h1>
                                    <p>
                                    La plataforma está diseñada para aportar a tu seguridad, pero como usuario debes evitar algunas acciones que pueden afectar la protección que te proporcionamos. Para ello, debes seguir las siguientes recomendaciones:
                                    </p>
                                    <ul>
                                        <li>No compartas tu ubicación exacta</li>
                                        <li>Si un usuario te pide descargar e instalar un programa, NO LO HAGAS</li>
                                        <li>SCuando acuerdes ver clases presenciales, hazlo acompañado de una persona de tu confianza e infórmale a tus familiares el lugar donde lo harás </li>                                            
                                        <li>No compartas información privada</li>
                                    </ul>
                                    <p>Siguiendo estas recomendaciones, contribuirás a tu seguridad personal.</p>
                                </div>
                            </div>
                        : attribute === 'mod=accounts'
                            ?   <div className="commomStylePadding accounts-information">
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
                                            Para usar tu cuenta con libertad, deberás diligenciar una información básica, la cual es utilizada para hacer una breve descripción tuya, para identificar quien eres, lo que facilita la búsqueda entre alumnos y profesores; se trata de generarte un perfil que permita tu rápida identificación dentro de la plataforma. 

                                            Para la configuración de su cuenta, el alumno debe aportar la siguiente información:
                                        </p>           
                                        <ul>
                                            <li>Primer nombre</li>
                                            <li>Primer Apellido</li>
                                            <li>Descripción</li>
                                            <li>Número de teléfono</li>
                                        </ul>
                                            
                                        <p>Para la configuración de su cuenta, el profesor debe aportar la siguiente información:</p>
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
                                        <p>Al hacer la configuración de tu cuenta, te ayudaremos a identificar el campo obligatorio con este ícono <i className="fa-solid fa-circle-exclamation field-required-icon" style={{ position: 'initial', top: 0, left: 0 }} title="Campo requerido"></i> en la configuracion de tu cuenta.</p>
                                        <br/><br/><Link to="/preference/mod=general" style={{ color: '#3282B8' }}>Ir a la configuracion de mi cuenta</Link>
                                    </div>

                                    <div className="information-card-content">
                                        <h1>Sanciones por mal uso de la cuenta</h1>
                                        <p>Existen 3 tipos de sanciones que pueden ser aplicadas cuando un usuario le da mal uso a su cuenta:</p>
                                        <ul>
                                            <li>Advertencia a través de la plataforma</li>
                                            <li>Suspensión temporal de la cuenta</li>
                                            <li>Bloqueo permanente de la cuenta</li>
                                        </ul>
                                        <p>Estas sanciones tienen como propósito principal garantizarle a nuestros usuarios la protección que requieren para utilizar la aplicación con absoluta confianza y dentro de un entorno seguro. A continuación, te explicamos las causas de cada una de dichas sanciones:</p>
                                            <br/><br/>
                                            <p>
                                                <b>Advertencia a través de la plataforma</b>: e origina por violaciones menores, tales como reclamos de usuarios a su cuenta, no asistir a una clase por videollamada, emplear palabras ofensivas, entre otras. La repetición de la misma advertencia podría conducir a la suspensión temporal de la cuenta.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                <b>Suspensión temporal de la cuenta</b>: ediante esta medida, la cuenta puede ser suspendida por un periodo de tiempo determinado. Tiene ocurrencia por violaciones medianas por parte del usuario que resulten en repeticiones de advertencias, en la utilización de imágenes no adecuadas durante los servicios, entre otros. El tiempo estimado para que la cuenta pueda ser desbloqueada dependerá de la gravedad de las violaciones a las reglas de la plataforma. El usuario debe tener en cuenta que nuestro sistema de funcionamiento está basado en los principios de tolerancia y respeto, lo que garantiza un grado de flexibilidad al momento de valorar las faltas, pero ante la repetición de las mismas violaciones, el tiempo de espera podría ser mucho mayor.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                <b>Bloqueo permanente de la cuenta</b>: Esta es la máxima sanción que se puede aplicar a un usuario, la cual resulta de violaciones mayores a las reglas de nuestra plataforma, como, por ejemplo: realizar amenazas o extorsionar a otros usuarios, ofrecer falsos servicios, utilizar o publicar links engañosos con contenido pornográfico, introducir virus u otros programas que amenacen o rompan con las buenas costumbres que sirven de base a nuestra aplicación. Cuando se imponga esta sanción, el bloqueo de la cuenta será permanente y el usuario no podrá volver a registrarse. En aplicación del derecho de defensa y del debido proceso, de acuerdo a los datos guardados en la base de datos, el usuario tendrá la oportunidad de defenderse exponiendo los argumentos que considere necesarios. Si sus argumentaciones carecen de sentido y no logran desvirtuar la falta, se procederá a su bloqueo permanente en la aplicación.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                Si sigues las normas, reglas y políticas de privacidad de forma correcta, no recibirías ningún llamado de atención. El objetivo de Penssum es brindarte la mejor experiencia, evitándote cualquier tipo de inconvenientes con otros usuarios que no respetan nuestras reglas, basadas en las buenas costumbres.
                                            </p>
                                    </div>
                                    <InformationCard
                                        title="Bloquear o reportar cuenta" 
                                        content="Si tienes inconvenientes con un usuario que te envíe palabras ofensivas a través de mensajes, si eres objeto de discriminación, de abuso verbal, entre otros, puedes bloquear, denunciar o reportar la cuenta. Si llegaras a bloquearla, la conversación terminará y no te podrá escribir más, no podrá tener acceso a la vista de tu perfil, número de teléfono, información personal ni a los servicios que prestes. Puedes decidir si quieres tener contacto con un usuario bloqueándolo y desbloqueándolo cuando lo consideres prudente. Si tu interés es, denunciar o reportar su cuenta, debes seleccionar la causa que te lo permitiría y con previa comunicación, lo podrás bloquear. La plataforma se encargará de revisar las conversaciones que hayas tenido con el usuario, para tomar las medidas correctivas respecto a este.
                                        La denuncia o reporte se recomienda si te escriben para extorsionarte, si se presenta abuso verbal en tu contra, si te solicitan o envían contenido obsceno, entre otras situaciones que consideres lesivas para tus intereses. Si, al revisar tu caso, advertimos que la denuncia o reporte no corresponde a la realidad o los argumentos presentados son falsos, la consecuencia podría ser la suspensión temporal de tu cuenta, o una advertencia por medio de la plataforma. Si un usuario te bloquea para evadirte o porque no te quiere pagar o por cualquier otro asunto, comunícate con nosotros, a fin de que tomemos las medidas necesarias para resolver la situación. "
                                    />
                                </div>
                            : attribute === 'mod=products'
                                ?   <div className="commomStylePadding product-help-information">
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
                                            Normalmente, para coordinar una clase, el alumno tendrá que hablar con el profesor y este decidirá como va a hacer la implementación de la clase, en este caso, si es por medio de esta plataforma o si lo hará en un salón de clases del que disponga, o si tiene ambas opciones. Recuerda, si te vas a reunir presencialmente con el profesor, toma las prevenciones de seguridad recomendadas, <Link to="/help/information/mod=security" className="help-nav-link">Conoce más de seguridad</Link>.
                                            </p>
                                        </div>
                                    </div>
                                : /*attribute === 'mod=call_video'
                                    ?   <div className="commomStylePadding call_video-help-information">
                                            <InformationCard
                                                title="Como organizar una videollamada"
                                                content="Los profesores puedn realizar videollamadas para dar clases a las ofertas aceptadas de un servicio, normalmente los profesores
                                                escogen la hora y el dia para la realizacion de la videollamada, recuerde que se podra reunir solo el alumno que el profesor elija para
                                                empezar la videollamada, los alumnos podrán pedir la peticion a la videollamada si su oferta fue aceptada, cuando crea un servicio 
                                                se le entregara un enlace de la videollamada."
                                            />
                                            <InformationCard
                                                title="Cuales son las opciones de una videollamada"
                                                content="Es mas sencillo de lo que parece, antes de iniciar la videollamada nos debera dar permisos para acceder a su microfono y a su camara,
                                                para poder mostrarlo en pantalla, si en llegado caso no lo acepta no podra entrar a la reunion, si acepta entrara con el microfono y la camara 
                                                apagada, puede activar el microfono y la camara en los iconos que se encuentra en la parte inferior, puede demandar a un proveedor o cliente por
                                                el mal uso de nuestra aplicacion si es necesario puede tomarle fotos y enviarlo a los administradores para entrar en accion, el icono de telefono
                                                es para colgar la videollamada y salirse de la reunion, si salio por accidente puede entrar normalmente por el enlace de la videollamada, si 
                                                la reunion ha finalizado el proveedor al tratar de colgar, le van a parecer 2 opciones, salirse de la reunion o finalizar reunion, si sale y las 2
                                                personas no estan conectadas la reunion se cerrara, y si selecciona la opcion de finalizar reunion los usuarios seran desconectados y se abra
                                                terminado la reunion."
                                            />
                                        </div>
                                    :*/ attribute === 'mod=frequent_questions'
                                        ?   <div className="commomStylePadding frequent_questions">
                                                <InformationCard
                                                    title="¿Cuánto tiempo dura una videollamada?"
                                                    content="La videollamada no tiene límite de tiempo."
                                                />
                                                <InformationCard
                                                    title="¿Puedo comunicarme fuera de la plataforma?"
                                                    content="Si puedes. No prohibimos la comunicación fuera de la plataforma, esto nos destaca como una aplicación de comercio electrónico de libre comunicación."
                                                />
                                                <InformationCard
                                                    title="¿Piensan expandir Penssum?"
                                                    content="Si, constantemente tenemos desarrolladores trabajando para el mejoramiento progresivo de Penssum, y pensamos expandirlo a otros países en el mediano plazo."
                                                />
                                                <InformationCard
                                                    title="¿Puedo ayudar al desarrollo de Penssum?"
                                                    content="!Si! te puedes comunicar con nosotros mediante el enlace de navegación del usuario en la opción `Enviar Comentarios`. Nos encantaría que nos ayudaras en el mejoramiento de nuestra aplicación, enviándonos comentarios sobre como te gustaría que mejoráramos, que podríamos añadir y lo que no te gusta de la aplicación."
                                                />
                                                <InformationCard
                                                    title="¿Como desarrollador podría trabajar en Penssum?"
                                                    content="Pensamos, a futuro, contratar a diferentes desarrolladores en todas las áreas para el desarrollo profesional de Penssum. ¡No te desanimes! Si eres desarrollador, diseñador gráfico, creador de contenido, muy pronto podrás trabajar con nosotros."
                                                />
                                            </div>
                                        : attribute === 'mod=terms_and_conditions'
                                            ?   <div className="commomStylePadding terms_and_conditions">
                                                    <InformationCard
                                                        title="Términos y condiciones para el uso de Penssum"
                                                        content="Los términos y condiciones para utilizar nuestra plataforma, traen consigo reglas que debes cumplir para su buen uso. Por favor, trata a los usuarios con quienes interactúes como te gustaría que te traten a ti, no permitimos contenido pornográfico, discriminación, racismo, palabras de doble sentido, contenido obsceno, extorsión ni ningún otro comportamiento que pueda romper con las buenas costumbres de la plataforma; cualquier uso inapropiado será penalizado con la suspensión o bloqueo de la cuenta. Tenga en cuenta que si se registra, acepta los términos y condiciones publicados en la plataforma; de esta manera, tratamos de garantizarle la mejor experiencia a nuestros usuarios y evitar malos entendidos que pudieran darse durante su uso. Todo el dinero que resulte de las actividades de la aplicación, se hace bajo completos estándares de seguridad, para ello, la información de las transferencias está totalmente cifrada, evitándose posibles estafas a nuestros usuarios y protegiendo el buen nombre de Penssum. Para esta plataforma, tu seguridad es primordial. Si quieres unirte a Penssum, por favor, ten en cuenta los términos y condiciones antes de usar nuestra aplicación, nos llenaría de una enorme satisfacción que nos escojas como una plataforma a la que puedes confiar tu comercio electrónico."
                                                    />
                                                </div>
                                            : <Navigate to="/help/information/mod=penssum"/>}
            </div>
        </div>
    );
};

export default HelpInformation;