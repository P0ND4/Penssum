import { useEffect, useState, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useSelector, useDispatch } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens

import Home from "../screen/app/Home";
import Search from "../screen/app/Search";
import Contacts from "../screen/app/Contacts";
import NotificationsScreen from "../screen/app/Notifications";
import CreatePost from "../screen/app/CreatePost";

import theme from "../theme";

import Ionicons from "@expo/vector-icons/Ionicons";
import { socket, getUncheckedMessages, getNotifications } from "../api";

import { logOut } from "../helpers/features/user/userSlice";
import { update as updateNotifications } from "../helpers/features/user/notificationsSlice";
import { update as updateContacts } from "../helpers/features/user/contactsSlice";
import { update as updateUsers } from "../helpers/features/helpers/usersSlice";

import { newUserApp } from "../api";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Tab = createBottomTabNavigator();

const AppStack = ({ navigation: stackNavigation }) => {
  const [countInMessages, setCountInMessages] = useState(0);
  const [countInNotification, setCountInNotification] = useState(0);

  const user = useSelector((state) => state.user);
  const socketRef = useRef(socket);
  const notificationListener = useRef();

  const dispatch = useDispatch();

  useEffect(() => {
    const register = async () => {
      const tokenExpirationDate = await AsyncStorage.getItem(
        "@token-expiration-date"
      );
      const currentDate = new Date();

      if (
        JSON.parse(tokenExpirationDate) &&
        Date.parse(JSON.parse(tokenExpirationDate)) < Date.parse(currentDate)
      ) {
        try {
          await AsyncStorage.removeItem("@token-expiration-date");
        } catch (e) {
          console.log(e);
        }
      }

      registerForPushNotificationsAsync().then((token) => console.log(token));
    };
    register();
  }, []);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      });
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, []);

  useEffect(() => {
    if (user) {
      socketRef.current.emit("connected", user._id);
      const obtainCountInformation = async () => {
        const briefMessages = await getUncheckedMessages(user._id);
        setCountInMessages(briefMessages.length);

        const briefNotifications = await getNotifications(user._id);

        let count = 0;

        for (let i = 0; i < briefNotifications.length; i++) {
          if (!briefNotifications[i].view) count += 1;
        }

        setCountInNotification(count);
      };
      obtainCountInformation();
    }
  }, []);

  useEffect(() => {
    socketRef.current.on("new_message", () =>
      setCountInMessages(countInMessages + 1)
    );
    socketRef.current.on("received event", () =>
      setCountInNotification(countInNotification + 1)
    );

    return () => {
      socketRef.current.off("new_message");
      socketRef.current.off("received event");
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;

      try {
        const value = await AsyncStorage.getItem("@token-expiration-date");
        const date = JSON.parse(value)

        if (!date) {
          await newUserApp({ id: user._id, expo: token });

          try {
            const date = new Date();
            var days = 5;
            date.setDate(date.getDate() + days);

            await AsyncStorage.setItem("@token-expiration-date", JSON.stringify(date));
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: theme.colors.main1, // borrar para modo claro
        },
        /*tabBarActiveTintColor: theme.colors.main2,
        tabBarInactiveTintColor: theme.colors.colorTextLight,*/
        tabBarActiveTintColor: "#EEEEEE",
        tabBarInactiveTintColor: "#777777",
        headerStyle: {
          backgroundColor: theme.colors.main1,
        },
        headerTintColor: "#EEEEEE",
        tabBarBadgeStyle: {
          backgroundColor: theme.colors.main2,
          fontSize: 17,
          height: 24,
          width: 24,
          borderRadius: 12,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: "Penssum",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={32} color={color} />
          ),
          headerRight: () => (
            <Ionicons
              onPress={() => {
                stackNavigation.replace("SignIn");
                setTimeout(() => {
                  dispatch(logOut());
                  dispatch(updateNotifications([]));
                  dispatch(updateContacts([]));
                  dispatch(updateUsers([]));
                }, 1000);
              }}
              name="log-out-outline"
              size={28}
              color="#FFFFFF"
              style={{ marginRight: 10 }}
            />
          ),
        }}
        component={Home}
      />
      <Tab.Screen
        name="Search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={32} color={color} />
          ),
        }}
        component={Search}
      />
      {/*user.objetive === "Alumno" && (
        <Tab.Screen
          name="Create"
          options={{
            title: "Crear publicación",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="add-circle"
                size={70}
                color={color}
                style={{
                  bottom: 10,
                  position: "absolute",
                  //color: theme.colors.main2,
                  color: "#FFFFFF",
                  shadowColor: "#666666",
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,

                  elevation: 44,
                }}
              />
            ),
          }}
          component={CreatePost}
        />
      )*/}
      <Tab.Screen
        name="Contacts"
        options={{
          title: "Mensajes",
          tabBarBadge:
            countInMessages !== 0
              ? countInMessages >= 10
                ? "+9"
                : countInMessages
              : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="mail" size={32} color={color} />
          ),
        }}
      >
        {(props) => (
          <Contacts
            stackNavigation={stackNavigation}
            {...props}
            setCountInMessages={setCountInMessages}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Notifications"
        options={{
          title: "Notificaciones",
          tabBarBadge:
            countInNotification !== 0
              ? countInNotification >= 10
                ? "+9"
                : countInNotification
              : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={32} color={color} />
          ),
        }}
      >
        {(props) => (
          <NotificationsScreen
            {...props}
            setCountInNotification={setCountInNotification}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AppStack;
