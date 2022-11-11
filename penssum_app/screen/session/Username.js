import { useState } from "react";
import { SafeAreaView, View, Image, StyleSheet, Vibration } from "react-native";

import TextStyle from "../../components/TextStyle";
import InputStyle from "../../components/InputStyle";
import ButtonStyle from "../../components/ButtonStyle";
import CustomNotification from "../../components/CustomNotification";

import Ionicons from "@expo/vector-icons/Ionicons";

import Background from "../../assets/resource/username.png";

import { createUser } from "../../api";

import theme from "../../theme";

const Username = ({ route, navigation }) => {
  const { data } = route.params;
  const [sendingInformation, setSendingInformation] = useState(false);
  const [username, setUsername] = useState("");
  const [notificationActive,setNotificationActive] = useState(false);
  const [error,setError] = useState('');

  const create = async () => {
    const currentData = data;
    currentData.username = username;
    currentData.validated = true;

    setSendingInformation(true);
    const result = await createUser(currentData);
    setSendingInformation(false);

    if (result.error) {
      if (result.type?.user) {
        setError("El nombre de usuario ya éxiste.");
        setNotificationActive(true);
        setUsername('');
      } else {
        setError("El usuario ya está registrado, por favor inicie sesión.");
        setNotificationActive(true);
        setTimeout(() => navigation.popToTop(), 1400);
      };
      Vibration.vibrate();
    } else {
      navigation.popToTop();
      navigation.push("UserCreated", { result });
    }
  };

  return (
    <SafeAreaView style={theme.styles.centerContainer}>
      <View>
        <TextStyle title>¡EXCELENTE!</TextStyle>
        <TextStyle small color="main2">
          Nos alegra mucho que estes utilizando nuestra aplicación, para
          finalizar elige un nombre de usuario
        </TextStyle>
      </View>
      <Image source={Background} style={styles.background} />
      <InputStyle
        placeholder="Nombre de usuario"
        maxLength={16}
        value={username}
        onChangeText={(text) => setUsername(text)}
        componentLeft={() => (
          <Ionicons
            name="person-outline"
            size={22}
            style={{ marginLeft: 20 }}
            color={theme.colors.colorTextLight}
          />
        )}
        componentRight={() => (
          <TextStyle right small customStyle={{ marginRight: 20 }}>
            {username.length}/16
          </TextStyle>
        )}
      />
      <ButtonStyle
        customButtonStyle={{
          opacity:
            /^[a-zA-Z0-9_.+-]{3,16}$/.test(username) && !sendingInformation
              ? 1
              : 0.5,
        }}
        onPress={() => {
          if (/^[a-zA-Z0-9_.+-]{3,16}$/.test(username) && !sendingInformation) {
            create();
          }
        }}
      >
        Finalizar
      </ButtonStyle>
      <CustomNotification
        error
        activate={notificationActive}
        setActivate={setNotificationActive}
        title={error}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "90%",
    height: 240,
  },
});

export default Username;
