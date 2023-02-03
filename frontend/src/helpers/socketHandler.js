import { useEffect, useCallback} from "react";
import { useDispatch } from "react-redux";
import { socket, getNotifications } from "../api";
import Cookies from "universal-cookie";
import { change as changeNotifications, set } from "../features/user/notificationsSlice";
import { Howl, Howler } from "howler";
import notificationSound from '../source/Notification.mp3';

const cookies = new Cookies();

export const useNotificationSocket = () => {
  const dispatch = useDispatch();

  const searchNotifications = useCallback(async () => {
    const briefNotifications = await getNotifications(cookies.get("id"));
    const currentNotification = [];
    let count = 0;

    for (let i = 0; i < 3; i++) {
      if (briefNotifications[i] !== undefined)
        currentNotification.push(briefNotifications[i]);
    }
    for (let i = 0; i < briefNotifications.length; i++) {
      if (!briefNotifications[i].view) count += 1;
    }

    dispatch(set(count));
    dispatch(changeNotifications(currentNotification));
  }, [dispatch]);

  useEffect(() => {
    socket.on("received event", async () => {
      await searchNotifications();
      const sound = new Howl({
        src: notificationSound,
      });
  
      sound.play();
    });

    return () => socket.off();
  });

  Howler.volume(0.5);
}