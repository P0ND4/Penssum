import { useSelector } from "react-redux";
import { thousandsSystem } from "../../../helpers";

function Advertising() {
  const {
    user: foundUserInformation,
    products: userProducts,
    score,
    tasksTaken,
  } = useSelector((state) => state.profile);

  return (
    <section className="advertising-container">
      <div className="advertising">
        <section>
          <h2>Actividad</h2>
          <p>
            Proyectos completados:{" "}
            <span>{foundUserInformation.completedWorks}</span>
          </p>
          {foundUserInformation.objetive === "Profesor" && (
            <p>
              Proyectos en curso: <span>{tasksTaken}</span>
            </p>
          )}
          {foundUserInformation.objetive === "Alumno" && (
            <p>
              Publicaciones actuales:{" "}
              <span>{thousandsSystem(userProducts.length)}</span>
            </p>
          )}
        </section>
        <section>
          <h2>Información</h2>
          {foundUserInformation.objetive === "Profesor" && (
            <p>
              Cobro por hora:{" "}
              <span>
                {foundUserInformation.valuePerHour === null ||
                foundUserInformation.valuePerHour === 0
                  ? "indefinido"
                  : `$${thousandsSystem(foundUserInformation.valuePerHour)}/Hr`}
              </span>
            </p>
          )}
          <p>
            Calificaciones de{" "}
            {foundUserInformation.objetive === "Profesor"
              ? "Alumnos"
              : "Profesores"}
            : <span>{thousandsSystem(score.count)}</span>
          </p>
          <p>
            Incumplimientos a las normas:{" "}
            <span>{thousandsSystem(foundUserInformation.breaches)}</span>
          </p>
          {foundUserInformation.objetive === "Profesor" && (
            <p>
              Facultad:{" "}
              <span>
                {foundUserInformation.faculties.length === 0
                  ? "indefinido"
                  : foundUserInformation.faculties[0]}
              </span>
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default Advertising;
