import { useSelector } from "react-redux";
import StatisticsCard from "../../components/dashboard/StatisticsCard";
import {
  WeeklyRegisteredUsers,
  UserState,
  PublishedProducts,
} from "../../components/dashboard/Graphics";

function General() {
  const information = useSelector((state) => state.dashboardInformation);

  return (
    <div className="commomStylePadding">
      <div className="main-header-dashboard">
        <h1>Bienvenido {information !== null ? information.name : ""}</h1>
        {/*<button><i className="fas fa-download"></i>Generar Reporte</button>*/}
      </div>
      <div className="statistics-card-container">
        <StatisticsCard
          color="#2c373d"
          name="Usuarios"
          information={information === null ? "..." : information.totalUsers}
          icono="fas fa-users"
        />
        <StatisticsCard
          color="#0F4C75"
          name="Publicaciones"
          information={information === null ? "..." : information.totalProducts}
          icono="fas fa-boxes"
        />
        <StatisticsCard
          color="#06a1c4"
          name="Ofertas concretadas"
          information={
            information === null ? "..." : information.concreteOffers
          }
          icono="far fa-handshake"
        />
        <StatisticsCard
          color="#ffa600"
          name="Productos a revisar"
          information={
            information === null ? "..." : information.productsToReview
          }
          icono="fas fa-history"
        />

        <StatisticsCard
          color="#009e00"
          name="Videollamadas concretadas"
          information={
            information === null ? "..." : information.videoCallsMade
          }
          icono="fas fa-video"
        />
        <StatisticsCard
          color="#830163"
          name="Violaciones de normas"
          information={
            information === null ? "..." : information.violationsTotal
          }
          icono="fas fa-exclamation-triangle"
        />
        <StatisticsCard
          color="#970000"
          name="Visitas a Penssum"
          information={
            information === null
              ? "..."
              : information.totalViews >= 1000 &&
                information.totalViews <= 1000000
              ? `${(information.totalViews * 0.001).toFixed(1)}K`
              : information.totalViews
          }
          icono="fas fa-eye"
        />
        <StatisticsCard
          color="#3282B8"
          name="Reportes"
          information={information === null ? "..." : information.reports}
          icono="fas fa-sticky-note"
        />
      </div>
      <div>
        <div className="graphics-container">
          <div className="WeeklyRegisteredUsers">
            <WeeklyRegisteredUsers
              registeredUsers={
                information === null
                  ? [0, 0, 0, 0, 0, 0, 0]
                  : information.registeredUsers
              }
            />
          </div>
          <div className="UserState">
            <UserState
              state={information === null ? [0, 0, 0] : information.usersStatus}
            />
          </div>
        </div>
        <div className="graphics">
          <PublishedProducts
            currentProducts={
              information === null
                ? [0, 0, 0, 0, 0, 0, 0]
                : information.currentProducts
            }
            lastProducts={
              information === null
                ? [0, 0, 0, 0, 0, 0, 0]
                : information.lastProducts
            }
          />
        </div>
      </div>
    </div>
  );
}

export default General;
