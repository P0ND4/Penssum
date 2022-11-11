import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Vibration } from "react-native";
import { useDispatch } from "react-redux";

import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "../../components/TextStyle";
import InputStyle from "../../components/InputStyle";
import ButtonStyle from "../../components/ButtonStyle";

import { loginUser, socket } from "../../api";
import { update } from '../../helpers/features/user/userSlice';

import background from "../../assets/resource/signin-password.png";

import theme from "../../theme";
import CustomNotification from "../../components/CustomNotification";

const SignInPassword = ({ navigation, route }) => {
  const { email } = route.params;
  const [sendingInformation,setSendingInformation] = useState(false);
  const [emailAbbreviation,setEmailAbbreviation] = useState(email);
  const [notificationActive,setNotificationActive] = useState(false);

  useEffect(() => {
    const array = email.split('@');
    
    array[0] = `${array[0].slice(0,20)}${array[0].length > 20 ? '...' : ''}`;

    setEmailAbbreviation(array.join('@'));    
  },[]);

  const [exit, setExit] = useState(false);
  const [isNavigate, setNavigate] = useState(false);

  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const socketRef = useRef(socket);

  const login = async () => {
    setSendingInformation(true);
    const result = await loginUser({ email, password });
    setTimeout(() => setSendingInformation(false),1000);

    if (result.error) {
      setNotificationActive(true);
      Vibration.vibrate();
      setPassword('');
    } else {
      dispatch(update(result));
      socketRef.current.emit('connected', result._id);
      navigation.popToTop();
      navigation.replace('App');
    }
  }

  return (
    <View style={theme.styles.container}>
      <View style={{ width: "100%" }}>
        <Ionicons
          name="arrow-back"
          size={34}
          color={theme.colors.colorTextDark}
          onPress={() => !exit && (navigation.pop(), setExit(true))}
        />
      </View>
      <View style={styles.body}>
        <TextStyle subtitle>¡BIENVENIDO DE NUEVO!</TextStyle>
        <TextStyle medium>{emailAbbreviation}</TextStyle>
        <TextStyle paragrahp color="main2">
          Por favor ingrese la contraseña
        </TextStyle>
        <Image source={background} style={styles.background} />
        <View style={{ marginBottom: 25, width: "100%" }}>
          <InputStyle
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <ButtonStyle 
            customButtonStyle={{
              opacity: password.length >= 6 && !sendingInformation ? 1 : 0.5
            }}
            onPress={() => password.length >= 6 && !sendingInformation && login()}
          >Iniciar sesión</ButtonStyle>
        </View>
        <TouchableOpacity
          onPress={() =>
            !isNavigate &&
            (navigation.push("Recovery", { email }),
            setNavigate(true),
            setTimeout(() => setNavigate(false), 500))
          }
        >
          <TextStyle
            color="main2"
            paragrahp
            customStyle={{ textDecorationLine: "underline" }}
          >
            ¿Olvidaste tu contraseña?
          </TextStyle>
        </TouchableOpacity>
      </View>
      <CustomNotification
        error
        activate={notificationActive}
        setActivate={setNotificationActive}
        title="Contraseña invalida"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    width: "100%",
    marginTop: 40,
    alignItems: "center",
  },
  background: {
    width: "80%",
    height: 240,
    marginVertical: 10,
  },
});

export default SignInPassword;
