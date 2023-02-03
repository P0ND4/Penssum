import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { markNotification } from "../api";
import PlainNotification from "../components/PlainNotification";
import { clean } from "../features/dashboard/notificationsSlice";

function Nav() {
  const notifications = useSelector((state) => state.dashboardNotifications);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenPlainNotification, setIsOpenPlainNotification] = useState(false);

  const dispatch = useDispatch();
  let menuDashboard = useRef();
  const plainNotificationBell = useRef();

  useEffect(() => {
    // CAMBIAR
    const menuDashboardhandler = (e) => {
      if (!menuDashboard.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", menuDashboardhandler);

    const handlerPlainNotification = (e) => {
      if (!plainNotificationBell.current.contains(e.target)) {
        setIsOpenPlainNotification(false);
      }
    };

    document.addEventListener("mousedown", handlerPlainNotification);

    return () => {
      document.removeEventListener("mousedown", menuDashboardhandler);
      document.removeEventListener("mousedown", handlerPlainNotification);
    };
  });

  return (
    <nav className="dashboard-nav">
      <div ref={menuDashboard}>
        <div className="main-dashboard-icon">
          <div ref={plainNotificationBell}>
            <div
              className="user-span-container"
              onClick={() => {
                if (notifications.count > 0) markNotification("Admin");
                dispatch(clean());
                setIsOpenPlainNotification(!isOpenPlainNotification);
              }}
            >
              <i className="fas fa-bell" id="bell-dashboard"></i>
              {notifications.count > 0 ? (
                <span className="user-count">
                  {notifications.count > 3 ? "+3" : notifications.count}
                </span>
              ) : (
                ""
              )}
            </div>
            <div
              className="plain-notification-dashboard-container"
              style={{
                display: isOpenPlainNotification ? "block" : "none",
              }}
            >
              {notifications.information !== null &&
              notifications.information.length > 0 ? (
                notifications.information.map(
                  (notification, index) =>
                    index < 3 && (
                      <div key={notification._id}>
                        <Link
                          to="/dashboard/notifications"
                          style={{ textDecoration: "none" }}
                          onClick={() => setIsOpenPlainNotification(false)}
                        >
                          <PlainNotification
                            title={notification.title}
                            description={notification.description}
                            color={notification.color}
                            image={notification.image}
                          />
                        </Link>
                      </div>
                    )
                )
              ) : (
                <p className="thereAreNoPlainNotification">
                  No hay notificaciones
                </p>
              )}
              {notifications.information !== null &&
              notifications.information.length > 0 ? (
                <Link
                  to="/dashboard/notifications"
                  className="notification-view"
                  onClick={() => setIsOpenPlainNotification(false)}
                >
                  Ver todas las notificaciones
                </Link>
              ) : (
                ""
              )}
            </div>
          </div>
          <i
            className="fas fa-user-circle"
            onClick={() => setIsOpen(!isOpen)}
          ></i>
        </div>
        <div
          className="options-dashboard"
          style={{ display: isOpen ? "flex" : "none" }}
        >
          <div className="options-divider-dashboard">
            <Link to="/dashboard/general" className="option-link-dashboard">
              <i className="fas fa-user-alt"></i> Perfil
            </Link>
          </div>
          <div className="options-divider-dashboard">
            <Link to="/dashboard/setting" className="option-link-dashboard">
              <i className="fas fa-cog"></i> Configuraciones
            </Link>
          </div>
          <hr />
          <div className="options-divider-dashboard">
            <Link to="/" className="option-link-dashboard">
              <i className="fas fa-sign-out-alt"></i> Salir
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
