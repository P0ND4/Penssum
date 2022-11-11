import { useRef } from "react";
import { TouchableOpacity, View, Image, Alert } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";

import Ionicons from "@expo/vector-icons/Ionicons";
import Recovery from "../screen/session/Recovery";

// session handling

import SignIn from "../screen/session/SignIn";
import SignInPassword from "../screen/session/SignInPassword";
import SignUp from "../screen/session/SignUp";
import GoogleAndFacebook from "../screen/session/partials/signup/GoogleAndFacebook";
import SignUpEmail from "../screen/session/SignUpEmail";
import Username from "../screen/session/Username";
import UserCreated from "../screen/session/UserCreated";

// Main

import App from "./AppStack";
import Messages from "../screen/app/partials/home/Messages";
import NoProfilePicture from "../assets/noProfilePicture.png";

import Logo from "../assets/icon.png";

import { socket, blockUser, removeBlock } from "../api";

import theme from "../theme";

const Stack = createStackNavigator();

const MainStack = () => {
  const user = useSelector((state) => state.user);

  const socketRef = useRef(socket);

  const block = async (from, to) => {
    Alert.alert("Bloquear", `¿Estas seguro?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Bloquear",
        onPress: async () => {
          const result = await blockUser({ from, to });

          if (!result.error) {
            socketRef.current.emit("get_contact", user._id);
            socketRef.current.emit("send_block", { from, to });
          }
        },
      },
    ]);
  };

  const deleteBlock = async (from, to) => {
    await removeBlock({ from, to });
    socketRef.current.emit("get_contact", user._id);
    socketRef.current.emit("unlocked", { userID: to, from });
  };

  return (
    <Stack.Navigator
      initialRouteName={!user ? "SignIn" : "App"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignInPassword" component={SignInPassword} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUpFacebookAndGoogle" component={GoogleAndFacebook} />
      <Stack.Screen name="SignUpEmail" component={SignUpEmail} />
      <Stack.Screen name="UserCreated" component={UserCreated} />
      <Stack.Screen name="Username" component={Username} />
      <Stack.Screen name="Recovery" component={Recovery} />
      <Stack.Screen name="App" component={App} />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={({ navigation, route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.main1,
          },
          headerTintColor: "#EEEEEE",
          title: route.params.name,
          headerRight: () => {
            const { idUser, firstName, contactKey } = route.params;
            const { currentBlock } = useSelector((state) =>
              state.contacts.find((contact) => contact.key === contactKey)
            );

            return currentBlock.length === 0 ? (
              firstName !== "Admin" && firstName !== undefined && (
                <TouchableOpacity
                  onPress={() => block(user._id, idUser)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 3,
                    marginRight: 14,
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={34}
                    color={theme.colors.main4}
                  />
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                onPress={() => deleteBlock(user._id, idUser)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 3,
                  marginRight: 14,
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={34}
                  color={theme.colors.main4}
                />
              </TouchableOpacity>
            );
          },
          headerLeft: () => {
            const { profilePicture, setIdUser } = route.params;

            return (
              <TouchableOpacity
                onPress={() => {
                  setIdUser("");
                  navigation.pop();
                }}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={{
                    marginVertical: 3,
                    marginLeft: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 3,
                    paddingHorizontal: 2,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={theme.colors.main4}
                  />
                  <Image
                    source={
                      profilePicture === null ||
                      profilePicture === "" ||
                      profilePicture === undefined ||
                      profilePicture === "Admin"
                        ? profilePicture === "Admin"
                          ? Logo
                          : NoProfilePicture
                        : { uri: profilePicture }
                    }
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 18,
                      backgroundColor: theme.colors.main4,
                      marginLeft: 5,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
