import { useSelector } from "react-redux";

function DaysInProfile({ mobile }) {
  const { isBlocked, user } = useSelector((state) => state.profile);
  const availability = user.availability;

  return (
    !isBlocked.blocked && (
      <div className={`profile-business-hours${mobile ? '-for-mobile' : ''}`}>
        <h1 className="business-hours-title">
          {user.objetive === "Profesor"
            ? "Horario De Atención"
            : "Días Disponible"}
        </h1>
        <div className="weeksdays-container">
          <p style={{ color: availability.monday ? "#3282B8" : "" }}>Lunes</p>
          <p style={{ color: availability.tuesday ? "#3282B8" : "" }}>Martes</p>
          <p style={{ color: availability.wednesday ? "#3282B8" : "" }}>
            Miercoles
          </p>
          <p style={{ color: availability.thursday ? "#3282B8" : "" }}>
            Jueves
          </p>
          <p style={{ color: availability.friday ? "#3282B8" : "" }}>Viernes</p>
          <p style={{ color: availability.saturday ? "#3282B8" : "" }}>
            Sábado
          </p>
          <p style={{ color: availability.sunday ? "#3282B8" : "" }}>Domingo</p>
        </div>
      </div>
    )
  );
}

export default DaysInProfile;
