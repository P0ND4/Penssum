import { useState, useRef } from "react";
import { View, Image } from "react-native";
import { useDispatch } from "react-redux";

import TextStyle from "../../components/TextStyle";
import ButtonStyle from "../../components/ButtonStyle";

import Ionicons from "@expo/vector-icons/Ionicons";

import { socket } from "../../api";

import { update } from "../../helpers/features/user/userSlice";

import UserCreatedImage from "../../assets/signup-successfully.png";

import theme from "../../theme";

const UserCreated = ({ navigation, route }) => {
  const [exit, setExit] = useState(false);
  const { result } = route.params;

  const dispatch = useDispatch();

  const socketRef = useRef(socket);

  const finished = () => {
    dispatch(update(result));
    socketRef.current.emit("connected", result._id);
    navigation.popToTop();
    navigation.push("App");
  };

  return (
    <View style={theme.styles.centerContainer}>
      <View style={{ width: "100%" }}>
        <Ionicons
          name="arrow-back"
          size={34}
          color={theme.colors.colorTextDark}
          onPress={() => {
            if (!exit) {
              navigation.pop();
              setExit(true);
            }
          }}
        />
      </View>
      <Image
        source={UserCreatedImage}
        style={{
          width: "90%",
          height: 180,
          borderRadius: 10,
          marginVertical: 20,
        }}
      />
      <TextStyle title>¡GRACIAS!</TextStyle>
      <TextStyle small color="main2" customStyle={{ marginVertical: 15 }}>
        Muchísimas gracias por registrarte en penssum, no te arrepentirás,
        ábrale las puertas al mundo del conocimiento.
      </TextStyle>
      <ButtonStyle onPress={() => finished()}>Ingresar</ButtonStyle>
    </View>
  );
};

export default UserCreated;
