import { useState, useEffect, useRef } from "react";
import { View, Keyboard, Vibration } from "react-native";
import { useDispatch } from "react-redux";

import InputStyle from "../../components/InputStyle";
import TextStyle from "../../components/TextStyle";
import ButtonStyle from "../../components/ButtonStyle";

import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../../theme";

import { getUser, recoveryPassword, changePassword, socket } from "../../api";
import { update } from "../../helpers/features/user/userSlice";
import CustomNotification from "../../components/CustomNotification";

const Recovery = ({ navigation, route }) => {
  const [exit, setExit] = useState(false);
  const [emailAbbreviation, setEmailAbbreviation] = useState(email);
  const [userInformation, setUserInformation] = useState(null);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState(null);
  const [validated, setValidated] = useState(false);
  const [password, setPassword] = useState("");
  const [sendingInformation, setSendingInformation] = useState(false);
  const [notificationOptions, setNotificationOptions] = useState({
    type: "",
    title: "",
    componentRight: null,
  });
  const [notificationActive, setNotificationActive] = useState(false);

  const { email } = route.params;

  const socketRef = useRef(socket);
  const dispatch = useDispatch();

  const searchUser = async () => {
    let user;
    if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(email))
      user = await getUser({ email });
    else user = await getUser({ username: email });
    setUserInformation(user);
  };

  useEffect(() => {
    if (!userInformation) searchUser();
    else {
      const sendEmail = async () => {
        const result = await recoveryPassword({ userInformation });
        setPin(result.code);
      };
      sendEmail();
    }
  }, [userInformation]);

  useEffect(() => {
    if (userInformation !== null) {
      const array = userInformation.email.split("@");

      array[0] = `${array[0].slice(0, 20)}${array[0].length > 20 ? "..." : ""}`;

      setEmailAbbreviation(array.join("@"));
    }
  }, [userInformation]);

  useEffect(() => {
    if (code.length === 6) {
      Keyboard.dismiss();

      if (pin === code) setValidated(true);
      else {
        setNotificationOptions({
          type: "error",
          title: "Código incorrecto.",
          componentRight: () => (
            <Ionicons
              name="close-circle-outline"
              color={theme.colors.main4}
              size={25}
            />
          ),
        });

        setNotificationActive(true);
        setCode("");
        Vibration.vibrate();
      }
    }
  }, [code]);

  return (
    <View style={theme.styles.centerContainer}>
      <View style={{ width: "100%" }}>
        <Ionicons
          name="arrow-back"
          size={34}
          color={theme.colors.colorTextDark}
          onPress={() => !exit && (navigation.pop(), setExit(true))}
        />
      </View>
      <View>
        <TextStyle title>¡RECUPERACIÓN!</TextStyle>
        <TextStyle medium>{emailAbbreviation}</TextStyle>
        <TextStyle small color="main2">
          Comprueba si recibiste un correo con tu código de 6 dígitos.
        </TextStyle>
      </View>
      <View style={{ marginTop: 30, width: "100%" }}>
        <InputStyle
          placeholder="Código"
          maxLength={6}
          keyboardType="numeric"
          returnKeyType="done"
          value={code}
          onChangeText={setCode}
          editable={!validated}
          selectTextOnFocus={!validated}
          disabled={validated}
          componentRight={() =>
            validated && (
              <Ionicons
                name="shield-checkmark"
                color={theme.colors.main1}
                size={30}
                style={{ marginRight: 10 }}
              />
            )
          }
        />
        <InputStyle
          placeholder="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <ButtonStyle
          customButtonStyle={{
            opacity:
              !sendingInformation && validated && /^.{6,30}$/.test(password)
                ? 1
                : 0.5,
          }}
          onPress={async () => {
            if (
              !sendingInformation &&
              validated &&
              /^.{6,30}$/.test(password)
            ) {
              Keyboard.dismiss();
              setSendingInformation(true);
              const result = await changePassword({
                id: userInformation._id,
                password: pin,
                newPassword: password,
                isForgot: true,
              });
              if (!result.error) {
                setNotificationOptions({
                  type: "success",
                  title: "Contraseña cambiada",
                  componentRight: () => (
                    <Ionicons
                      name="checkmark-circle-outline"
                      color={theme.colors.main4}
                      size={25}
                    />
                  ),
                });

                setNotificationActive(true);
                dispatch(update(result));
                socketRef.current.emit("connected", result._id);
                setTimeout(() => {
                  navigation.popToTop();
                  navigation.replace("App");
                },1500);
              }
              setSendingInformation(true);
            }
          }}
        >
          Continuar
        </ButtonStyle>
      </View>
      <CustomNotification
        activate={notificationActive}
        setActivate={setNotificationActive}
        type={notificationOptions.type}
        title={notificationOptions.title}
        componentRight={notificationOptions.componentRight}
      />
    </View>
  );
};

export default Recovery;
