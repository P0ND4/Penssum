import { useSelector } from "react-redux";
import NotificationSection from "../../components/NotificationSection";
import Loading from "../../components/Loading";

function Notifications() {
  const notifications = useSelector(state => state.dashboardNotifications)

  return (
    <div className="commomStylePadding">
      <div className="notifications-dashboard-container">
        <h1>NOTIFICACIONES</h1>
        <div className="notifications-dashboard-section">
          {notifications.information !== null ? (
            notifications.information.length > 0 ? (
              notifications.information.map((notification) => {
                return (
                  <div key={notification._id}>
                    <NotificationSection
                      productId={notification.productId}
                      username={notification.username}
                      title={notification.title}
                      creationDate={notification.creationDate}
                      description={notification.description}
                      files={notification.files}
                      admin={true}
                    />
                  </div>
                );
              })
            ) : (
              <h1 className="thereAreNoNotifications">NO HAY NOTIFICACIONES</h1>
            )
          ) : <Loading margin="auto" />}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
