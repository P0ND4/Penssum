import InformationCard from "../../components/helpZone/InformationCard";

const FrequentQuestions = () => {
  return (
    <div className="commomStylePadding frequent_questions">
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
  );
};

export default FrequentQuestions;
