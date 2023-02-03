import React from "react";

function Description() {
  return (
    <div className="container-description-signup">
      <div className="description-signup">
        <h1>¡Regístrate YA!</h1>
        <p>
          Al registrarte aceptas los términos y condiciones del uso apropiado de
          la aplicación, llevando la responsabilidad y el uso adecuado, lea con
          atención las siguientes características, una vez registrada la cuenta
          podrá hacer uso de las siguientes funcionalidades:
        </p>
        <ul>
          <li>Tener perfil personalizable</li>
          <li>Podrá comprar productos</li>
          <li>Podrá publicar productos</li>
          <li>Podrá tener acceso a videollamadas</li>
        </ul>
        <p>Estas son algunas reglas que debe cumplir: </p>
        <ul>
          <li>
            No está permitido indicio de pornografía, juguetes sexuales, u otros
          </li>
          <li>Impuntualidad a la presentación por videollamada</li>
          <li>
            No está permitido las malas palabras, discriminación, racismo,
            incitar al odio, palabras de doble sentido u otro en publicaciones.
          </li>
        </ul>
        <p>
          Algún incumplimiento de estas reglas pueden llevar a cabo las
          siguientes penalizaciones:{" "}
        </p>
        <ul>
          <li>La advertencia por medio de la aplicación</li>
          <li>La suspensión temporal</li>
          <li>El bloqueo permanente</li>
        </ul>
        <p>Por favor, siga las reglas con prudencia.</p>
      </div>
    </div>
  );
}

export default Description;
