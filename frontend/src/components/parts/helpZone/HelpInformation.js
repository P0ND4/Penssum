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
                    <p>Terminos y condiciones</p>
                </Link>
            </div>
            <div className="main-helpInformation-section">
                <i className="fas fa-chevron-left" id="fa-chevron-left-helpInformation" onClick={() => document.querySelector('.helpInformation-sections-container').classList.remove('helpInformation-sections-container-in-mobile')}></i>
                {attribute === 'mod=penssum'
                    ?   <div className="commomStylePadding protech">
                            <InformationCard 
                                title="Penssum" 
                                content="Penssum es una plataforma de asistencia académica, que permite a los estudiantes conectarse con los mejores docentes en soluciones inmediatas a las actividades diarias currículares más exigentes, es el mejor aliado estratégico para fortalecer y obtener conocimientos y las mejores calificaciones de una manera fácil ágil y segura." 
                                />
                            <InformationCard 
                                title="¿Porque elegirnos?" 
                                content="Somos la unica plataforma que te da la oportunidad de hacer ofertas a los
                                        profesores/alumnos desde la misma web, teniendo contacto directo, 
                                        no le prohibimos la comunicacion fuera de la aplicacion web, pueden tener un chat
                                        desde su propio perfil comunicandose sin ningun problema con los demas,
                                        puede tener la opcion de demandar y bloquear usuario, para evitar malos entendidos,
                                        he inconvenientes, los servicios de profesores tienen la opcion de programar una 
                                        videollamada para poder tener un salon de clases desde la misma web, tenemos
                                        la atencion al cliente las 24 horas, por lo que si tiene algun inconveniente o un
                                        problema, puede comunicarse con nosotros desde el panel de navegacion de su perfil." 
                                />
                            <div className="information-card-content">
                                <h1>Ventajas de usar Penssum</h1>
                                <p>Hemos preparado una lista de las ventajas de usar nuestra aplicacion estas son: </p>
                                <ul>
                                    <li>Seguridad 100% garantizada</li>
                                    <li>Publicacion de servicio rompiendo record en velocidad</li>
                                    <li>Los mejores precios del mercado</li>
                                    <li>Posibilidad de ofertas y contraoferta</li>
                                    <li>Comunicacion dentro de la aplicacion</li>
                                    <li>Libertad de comunicacion fuera de la plataforma</li>
                                    <li>Atencion al cliente las 24 horas</li>
                                    <li>Prohibicion de servicios o contenido obseno en nuestra aplicacion</li>
                                    <li>Facil navegavilidad</li>
                                    <li>Configuracion de su perfil</li>
                                    <li>Acceso a videollamada</li>
                                    <li>Registro sencillo con validacion</li>
                                    <li>Registro como alumno y profesor</li>
                                    <li>Uso confiable de nuestra plataforma</li>
                                </ul>
                                <p>Y mucho mas para asegurarle la mejor experiencia de usuario que jamas haya tenido.</p>
                            </div>
                        </div> 
                    : attribute === 'mod=security'
                        ?   <div className="commomStylePadding security-information">
                                <InformationCard 
                                    title="Seguridad" 
                                    content="Al entrar en nuestra aplicacion web te ofrecemos la mayor seguridad a tu informacion
                                            teniendo en cuenta la privacidad de cada usuario, todas las secciones de la plataforma
                                            son segura y privada." 
                                />
                                <div className="information-card-content">
                                    <h1>¿Como aportamos a tu seguirdad?</h1>
                                    <p>
                                        Tu seguridad es importante para nosotros al usar nuestra plataforma, por lo
                                        que es obligatorio para nosotros aportar a tu seguridad. Te damos unos ejemplos
                                        de como te protegemos. 
                                    </p>
                                    <ul>
                                        <li>Toda tu informacion esta cifrada</li>
                                        <li>Todas las conversaciones que tengas son solo para ti</li>
                                        <li>Cualquier conducta inadecuada lo puedes reportar y nosotros actuaremos</li>
                                        <li>Las transacciones que hagas por medio de la plataforma son seguras</li>
                                        <li>Te protegemos de enlaces maliciosos en nuestra aplicacion</li>
                                        <li>100% libre de virus</li>
                                        <li>Toda la informacion de los servicios son revisados antes de ser publicados para evitar malware</li>
                                    </ul>
                                    <p>Esto y mas son unos ejemplos de como aportamos a tu seguridad en nuestra aplicacion web.</p>
                                </div>
                                <div className="information-card-content">
                                    <h1>Consejos de seguridad</h1>
                                    <p>
                                        Nosotros aportamos a tu seguridad, pero no podemos evitar muchas cosas dentro de la plataforma,
                                        te damos unos consejos que deberias seguir. 
                                    </p>
                                    <ul>
                                        <li>No compartas tu ubicacion exacta</li>
                                        <li>Si un usuario te pide descargar un programa he instalarlo, NO LO HAGAS</li>
                                        <li>Si se ponen de acuerdo para ver clases presencial, siempre ande acompañado, y digale a sus familiares donde piensa ir</li>                                            
                                        <li>No comparta informacion privada</li>
                                    </ul>
                                    <p>Estas son unas de las recomendaciones para contribuir a su seguridad.</p>
                                </div>
                            </div>
                        : attribute === 'mod=accounts'
                            ?   <div className="commomStylePadding accounts-information">
                                    <InformationCard
                                        title="Cuentas" 
                                        content="En nuestra aplicacion web te puedes registrar por 2 cuentas diferentes.
                                                La cuenta profesor, y la cuenta de alumno, al registrarte como profesor
                                                podras publicar tus enseñanza y dar tu servicio como profesor, al registrarte 
                                                como cliente puedes pedir los servicios que necesites y ofertar a los 
                                                servicios de los profesores, si tienes una tarea que no entiendes puedes publicar
                                                un servicio de categoria (resolver) para que alguien te ayude en tu tarea." 
                                    />

                                    <InformationCard
                                        title="Configuracion de la cuenta" 
                                        content="La configuracion de la cuenta no es tan compleja si tiene la session iniciada podra ir seleccionando la 
                                        barra de navegacion de su cuenta y seleccionar PREFERENCIAS una vez estando dentro, tendra la libertad de decidir
                                        que va hacer con su cuenta, y personalizala a su gusto, si quiere cambiar la foto de perfil o foto de portada,
                                        podra hacerlo navegando hacia la seccion de su perfil y seleccionando el icono de un lapiz a la imagen que desee 
                                        cambiar."
                                    />

                                    <div className="information-card-content">
                                        <h1>Informacion requerida</h1>
                                        <p>
                                            Para utilizar tu cuenta con libertad deberas llenar informacion basica,
                                            esta informacion se utiliza para hacer una breve descripcion de quien eres,
                                            por ende facilitamos la busquedad entre alumnos y profesores, la descripcion
                                            es importante para facilitar la busquedad, da tu mejor descripcion.

                                            Configuracion necesaria para el alumno:
                                        </p>           
                                        <ul>
                                            <li>Primer nombre</li>
                                            <li>Primer Apellido</li>
                                            <li>Descripcion</li>
                                            <li>Numero de telefono</li>
                                        </ul>
                                            
                                        <p>Configuracion necesaria para el profesor:</p>
                                        <ul>
                                            <li>Primer nombre</li>
                                            <li>Segundo nombre</li>
                                            <li>Primer apellido</li>
                                            <li>Segundo Apellido</li>
                                            <li>Descripcion</li>
                                            <li>Cedula de identidad</li>
                                            <li>Numero de telefono</li>
                                            <li>Ciudad</li>
                                        </ul>
                                        <p>Te ayudaremos a identificar el campo obligatorio con este icono <i className="fa-solid fa-circle-exclamation field-required-icon" style={{ position: 'initial', top: 0, left: 0 }} title="Campo requerido"></i> en la configuracion de tu cuenta.</p>
                                        <br/><br/><Link to="/preference/mod=general" style={{ color: '#3282B8' }}>Ir a la configuracion de mi cuenta</Link>
                                    </div>

                                    <div className="information-card-content">
                                        <h1>Tipos de suspencion a las cuentas</h1>
                                        <p>Existe 3 tipos de suspencion de una cuenta</p>
                                        <ul>
                                            <li>Advertencia a traves de la plataforma</li>
                                            <li>Suspencion de cuenta temporal</li>
                                            <li>Bloqueo permanete de la cuenta</li>
                                        </ul>
                                        <p>Estas suspenciones tienen su motivo pero vamos a detallar por que pasan.</p>
                                            <br/><br/>
                                            <p>
                                                <b>Advertencia a traves de la plataforma</b>: Esta mas que una suspencion como dice su nombre
                                                es una advertencia debido a violaciones menores en nuestra plataforma, esta puede ser reclamos
                                                de usuarios a su cuenta, no cumplir con una clase por videollamada, palabras ofensivas, entre
                                                otras, la repeticion de la misma advertencia podria llevar a cabo la suspencion temporal de la
                                                cuenta.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                <b>Suspencion de cuenta temporal</b>: Esta es una suspencion a la cuenta por un periodo de tiempo 
                                                por violaciones medianas del uso de nuestra aplicacion web, podria ser provocada por repeticiones de
                                                advertencia, imagenes no adecuadas en los servicios, entre otros, el tiempo estimado para que la 
                                                cuenta pueda ser desbloqueada dependera de la gravedad de la violaciones a las reglas de la plataforma,
                                                se puede tener una cierta tolerancia a las faltas, pero si se repiten las misma violacion otra vez el 
                                                tiempo de espera podria ser mucho mayor.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                <b>Bloqueo permanente de la cuenta</b>: Esta es la suspencion mayor que una cuenta prodria tener, esto
                                                se debe a violaciones mayores a las reglas de nuestra plataforma, podria ser provocada por: amenazas 
                                                contra los usuarios, extorsion, falsos servicios, links engañosos con contenido pornografico, virus o
                                                otro programa que rompen las buenas costumbre de nuestra aplicacion, el bloqueo de la cuenta es permanente,
                                                y no se podra volver a registrar teniendo en cuenta los datos guardados en la base de datos, se le dara la
                                                oportunidad al usuario de poder defenderse, en llegado caso de no tener sentido el argumento se le quitara 
                                                la opcion de defensa y quedara bloqueado permanentemente en la aplicacion.
                                            </p>
                                            <br/><br/>
                                            <p>
                                                Si sigues las normas, reglas y las politicas de privacidad correctamente no deberia tener ninguna llamada 
                                                de atencion, queremos que nuestra plataforma sea la mejor experiencia de usuario y no queremos que tenga 
                                                inconvenientes con usuarios que no respetan nuestras buenas costumbres.
                                            </p>
                                    </div>
                                    <InformationCard
                                        title="Bloquear o demandar cuenta" 
                                        content="Si tiene inconveniente con un usuario a traves de mensaje por palabras ofensivas, discriminacion, 
                                        abuso verbal, entre otras cosas que no le podria parecer podria bloquear o demandar la cuenta en llegado 
                                        caso que bloquee la cuenta, la conversacion terminara y no le podra escribir mas, no podra tener acceso a 
                                        la vista de su perfil, numero de telefono, infomacion, y servicios que tenga que ver con usted, esto le
                                        ayudara si no quiere tener contacto con esa persona, asi como lo puede bloquear lo podra desbloquear, en
                                        llegado caso que le de en demandar seleccionara el porque lo quiere demandar, y con su permiso lo bloqueara
                                        y las conversaciones que haya tenido con el usuario seran revisadas para tomar medidas con el usuario demandado
                                        esto se recomienda si le escriben por extorsion, abuso verbal, contenido obseno, entre otras que considere, de
                                        ser mentira la demanda podria traer como consecuencia la suspencion de la cuenta temporal, o una advertencia por
                                        medio de la plataforma, si un usuario lo bloqueo porque lo quiere evadir, no le quiere pagar, o algo que considere 
                                        comuniquese con nosotros y actuaremos."
                                    />
                                </div>
                            : attribute === 'mod=products'
                                ?   <div className="commomStylePadding product-help-information">
                                        <InformationCard
                                            title="Servicio o actividad"
                                            content="En nuestra aplicacion el principal enfoque es el comercio electronico ya sea, por un servicio o una actividad
                                            que desee realizar, puede dar clases de matematicas, como puede dar cursor, como necesitar algo, si
                                            necesitas que te ayuden por ejemplo en una tarea de algebra puedes publicar tu actividad como: Necesito ayuda en algebra,
                                            esto es el enfoque principal de nuestra plataforma y deseamos que consiga usuarios que necesiten lo que enseñen o ofrezcan, y
                                            tendran personas dispuestas a colaborar con usted acerca de lo que este necesitando, lo que nos destaca como una plataforma de
                                            comercio electronico es que tiene la posibilidad de hacer una oferta en un servicio o actividad, en llegado caso de no tener 
                                            la suma presupuestada puede publicar cuanto dinero dispone para tal servicio o actividad y el profesor/alumno decidira si aceptan 
                                            la oferta o le responde con una contraoferta."
                                        />
                                        <InformationCard
                                            title="Como publicar un servicio o actividad"
                                            content="Para publicar un servicio o una actividad se necesitara que este registrado en la plataforma y cumplir con los requisitos
                                            pedido, cada tipo de cuenta como PROFESOR y ALUMNO tiene unos requisitos que cada uno de las cuentas deben cumplir, la informacion 
                                            que necesita para llenar estos requisitos estara en la seccion de su perfil, aparecera como una advertencia, diciendo: *necesitas 
                                            rellenar los siguientes requisitos para poder publicar tus productos o actividad.* Una vez completado lo pedido podra publicar tus
                                            servicios y mostrarle al mundo lo que ofreces"
                                        />
                                        <InformationCard
                                            title="Revicion del servicio o actividad"
                                            content="Una vez finalizada la creacion del servicio o actividad sera enviada a revision, este proceso dura maximo 24 horas, en este
                                            transcurso de revision, se validara si la descripcion, las categorias personalizada, y las imagenes sea de acorde al contenido colocado,
                                            esto es para evitar cualquier contenido pornografico, obseno o grosero. Cualquier contenido inadecuado se penalizara de acorde a la gravedad
                                            de la violacion a los terminos y condiciones del uso de Penssum."
                                        />
                                        <InformationCard
                                            title="Ver ofertas recibidas en mis servicios o actividad"
                                            content="Si quieres ver las ofertas que has tenido puedes entrar a un servicio o actividad de tu pertenencia y te va aparecer una opcion
                                            que solo a ti te va a parecer que dice *Ver ofertas recibidas* una vez que estes dentro vas a ver el nombre de los usuarios de las personas 
                                            que han ofertado."
                                        />
                                        <InformationCard
                                            title="Opciones de ofertas en los servicios o actividad"
                                            content="una vez estes dentro de las ofertas de tus productos te van aparecer los nombres de los usuarios que han ofertado y al lado de sus nombres te 
                                            va aparecer 4 opciones, el primero es el mensaje, eso es si quieres comunicarte con el usuario a traves de la plataforma, 
                                            el segundo es responder con una contraoferta, si quieres subir un poco el precio de lo ofertado lo puedes hacer, el tercero es denegar oferta, esto 
                                            le enviara una notificacion al usuario denegado diciendo que la oferta no a sido aceptada, y la cuarta opcion es aceptar oferta, si aceptas la oferta 
                                            se le notificara al usuario aceptado por correo y notificacion que su oferta a sido aceptada, luego tendran que hablar por mensaje segun su 
                                            preferencia para concretar el servicio."
                                        />
                                        <div className="information-card-content">
                                            <h1>Como coordinar la clase</h1>
                                            <p>
                                                Normalmente para coodinar una clase se tendria que hablar con el profesor, el decidira como va hacer la implementacion de la clase si es por medio de esta
                                                plataforma o tiene un salon de clases, o tiene ambas opciones, tenga en cuenta que si se va a reunir tome la prevenciones de seguridad recomendadas, <Link to="/help/information/mod=security" className="help-nav-link">Conoce mas de seguridad</Link>.
                                            </p>
                                        </div>
                                    </div>
                                : /*attribute === 'mod=call_video'
                                    ?   <div className="commomStylePadding call_video-help-information">
                                            <InformationCard
                                                title="Como organizar una videollamada"
                                                content="Los profesores podran realizar videollamadas para dar clases a las ofertas aceptadas de un servicio, normalmente los profesores
                                                escogen la hora y el dia para la realizacion de la videollamada, recuerde que se podra reunir solo el alumno que el profesor elija para
                                                empezar la videollamada, los alumnos podran pedir la peticion a la videollamada si su oferta fue aceptada, cuando crea un servicio 
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
                                                    title="Cuanto tiempo dura una videollamada"
                                                    content="La videollamada no tiene limite de tiempo."
                                                />
                                                <InformationCard
                                                    title="Puedo comunicarme fuera de la plataforma"
                                                    content="Si puede. No le prohibimos la comunicacion fuera de la plataforma, esto nos destaca como una aplicacion de comercio electronico de libre comunicacion."
                                                />
                                                <InformationCard
                                                    title="Piensan expandir Penssum"
                                                    content="Si constantemente tenemos desarrolladores trabajando para el mejoramiento progresivo de Penssum, y pensamos expandirlo a otros paises a medida que pasa
                                                    el tiempo."
                                                />
                                                <InformationCard
                                                    title="Puedo ayudar al desarrollo de Penssum"
                                                    content="!Si! te puedes comunicar con nosotros en el enlace de navegacion del usuario en la opcion de Enviar comentarios, nos encataria que nos ayudaras en el mejoramiento
                                                    de nuestra aplicacion, envianos comentarios de como te gustaria que mejoraramos, que podriamos añadir y que no te gusta de la aplicacion."
                                                />
                                                <InformationCard
                                                    title="Como desarrollador podria trabajar en Penssum"
                                                    content="Pensamos a futuro contratar diferentes desarrolladores de todas las indoles para el desarrollo profesional de Penssum, no te desanimes, muy pronto si eres desarollador,
                                                    diseñador grafico, creador de contenido, podras trabajar con nosotros."
                                                />
                                            </div>
                                        : attribute === 'mod=terms_and_conditions'
                                            ?   <div className="commomStylePadding terms_and_conditions">
                                                    <InformationCard
                                                        title="Terminos y condiciones del uso de Penssum"
                                                        content="Los terminos y condiciones del uso de nuestra plataforma trae consigo reglas que debes cumplir para el buen uso de nuestra
                                                        aplicacion, por favor trata a los usuarios como te gustaria que te traten, no permitimos contenido pornografico, discrciminacion, racismo,
                                                        palabras de doble sentido, contenido obseno, extorsion, y cualquier otra cosa que rompen las buenas costumbres de la plataforma, cualquier uso inapropiado
                                                        sera penalizado con la suspencion o bloqueo de su cuenta, si se registra acepta los terminos y condiciones actualmente presentado, esto
                                                        lo hacemos para que puedan tener la mejor experiencia de usuario y evitar malos entendidos en nuestra platafoma, todo el dinero manejado es
                                                        completamente seguro toda la informacion de transferencia esta totalmente cifrada para evitar estafas y consigo traer la mala fama a nuestra aplicacion web,
                                                        tu seguridad es primordial para nosotros, si quieres unirte a Penssum por favor ten en cuenta los terminos y condiciones antes de usar nuestra aplicacion,
                                                        nos alegraria grandemente que nos escojas como plataforma de tu comercio electronico. 
                                                        "
                                                    />
                                                </div>
                                            : <Navigate to="/help/information/mod=penssum"/>}
            </div>
        </div>
    );
};

export default HelpInformation;