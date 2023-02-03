import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { thousandsSystem, verificationOfInformation } from "../../../helpers";

function Handlers() {
  const user = useSelector(state => state.user);
  const suspended = useSelector(state => state.suspended);
  const hangTime = useSelector((state) => state.hangTime);
  const auth = useSelector(state => state.auth);
  const { transaction, money } = useSelector(state => state.profile);

  const { username } = useParams();

  return (
    <>
      {suspended && hangTime !== null && (
        <section className="userSuspendedContainer">
          <p className="suspended-title">Tiempo de suspensión</p>
          <div className="profile-date-timer">
            <div className="profile-timer-data">
              <p className="timer-data-title">Dias</p>
              <p className="profile-count-timer-data">{hangTime.remainDays}</p>
            </div>
            <div className="profile-timer-data">
              <p className="timer-data-title">Horas</p>
              <p className="profile-count-timer-data">{hangTime.remainHours}</p>
            </div>
            <div className="profile-timer-data">
              <p className="timer-data-title">Minutos</p>
              <p className="profile-count-timer-data">
                {hangTime.remainMinutes}
              </p>
            </div>
            <div className="profile-timer-data">
              <p className="timer-data-title">Segundos</p>
              <p className="profile-count-timer-data">
                {hangTime.remainSeconds}
              </p>
            </div>
          </div>
        </section>
      )}
      {auth && !suspended && transaction.active && (
        <div className="profile-money-container">
          {user.username === username && money !== 0 && (
            <p className="profile-money-on-hold">
              Dinero en espera: <span>${thousandsSystem(money)}</span>
            </p>
          )}
          {user.username === username && transaction.active && (
            <p className="profile-money-pit">
              Dinero retenido:{" "}
              <span>${thousandsSystem(transaction.amount)}</span>
            </p>
          )}
          {user.username === username &&
            transaction.active &&
            money !== 0 && (
              <p className="profile-money-total">
                Dinero total:{" "}
                <span>
                  ${thousandsSystem(transaction.amount + money)}
                </span>
              </p>
            )}
        </div>
      )}
      {!verificationOfInformation(user.objetive, user) &&
        user.username === username && (
          <section className="complete-information">
            <p>
              <i className="fa-solid fa-circle-exclamation"></i> Necesitas
              completar tu información como {user.objetive},{" "}
              <Link to="/complete/information">Completar información</Link>
            </p>
          </section>
        )}
    </>
  );
}

export default Handlers;
