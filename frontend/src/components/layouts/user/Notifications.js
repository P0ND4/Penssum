import { useState, useEffect } from 'react';
import { getNotifications } from '../../../api';
import NotificationSection from '../../parts/NotificationSection';
import Loading from '../../parts/Loading';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Notifications() {
    const [notifications, setNotifications] = useState(null);

    useEffect(() => {
        const searchNotifications = async () => {
            const result = await getNotifications(cookies.get('id'));
            setNotifications(result);
        };
        searchNotifications();
    }, []);

    return (
        <div className="notifications-container">
            <div className="notifications">
                <h1 className="notification-title">NOTIFICACIONES</h1>
                <div className="notification-padding">
                    {notifications !== null
                        ? notifications.length > 0
                            ? notifications.map(notification => {
                                return (
                                    <div key={notification._id}>
                                        <NotificationSection
                                            productId={notification.productId}
                                            username={notification.username}
                                            firstName={notification.firstName}
                                            lastName={notification.lastName}
                                            title={notification.title}
                                            creationDate={notification.creationDate}
                                            description={notification.description}
                                            files={notification.files}
                                            admin={false}
                                        />
                                    </div>
                                )
                            }) : <h1 className="thereAreNoNotifications">NO HAY NOTIFICACIONES</h1>
                        : <Loading margin="auto" />}
                </div>
            </div>
        </div>
    );
};

export default Notifications;