import InformationCard from "../../components/helpZone/InformationCard";

const VideoCall = () => {
  return (
    <div className="commomStylePadding call_video-help-information">
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
  );
};

export default VideoCall;
