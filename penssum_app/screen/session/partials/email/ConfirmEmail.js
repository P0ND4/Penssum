import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Image,
  Keyboard,
  StyleSheet,
  Vibration,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import TextStyle from "../../../../components/TextStyle";
import ButtonStyle from "../../../../components/ButtonStyle";
import InputStyle from "../../../../components/InputStyle";

import theme from "../../../../theme";

import CheckEmail from "../../../../assets/resource/check-email.png";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { apkSingUp } from "../../../../api";

const ConfirmEmail = ({
  data,
  setData,
  tags,
  subjects,
  setNotificationOptions,
  setNotificationActive,
}) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState(null);

  const maxLength = 6;

  const navigation = useNavigation();

  const getPin = async () => {
    const result = await apkSingUp({ email: data.email, name: data.firstName });
    setPin(result.code);
  };

  useEffect(() => {
    getPin();
    setEmail(data.email);
  }, [data]);

  useEffect(() => {
    if (maxLength === code.length) {
      Keyboard.dismiss();

      if (pin === code) {
        setCode("");
        const currentData = data;

        currentData.specialty = {
          subjects: subjects.join(", "),
          topics: tags.join(", ")
        };

        navigation.push("Username", { data: currentData });
      } else {
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

  const textInputRef = useRef(null);
  const [inputContainerIsFocused, setInputContainerIsFocused] = useState(false); // Evento si esta abierto el input

  const codeDigitsArray = new Array(maxLength).fill(0);

  const handleBlur = () => {
    setInputContainerIsFocused(false); // Cuando el input no esta activo
  };

  const handleOnPress = () => {
    // Cuando el input esta activo
    setInputContainerIsFocused(true);
    textInputRef?.current?.focus();
  };

  const toCodeDigitInput = (_value, index) => {
    // Digitar numeros en pantalla
    const emptyInputChar = " ";
    const digit = code[index] || emptyInputChar;

    return (
      <TextStyle
        onPress={handleOnPress}
        key={index}
        subtitle
        customStyle={[
          styles.verificationCode,
          {
            backgroundColor:
              inputContainerIsFocused && index === code.length
                ? theme.colors.main2
                : "#FFFFFF",
          },
        ]}
      >
        {digit}
      </TextStyle>
    );
  };

  return (
    <KeyboardAwareScrollView>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
        }}
      >
        <View>
          <View>
            <TextStyle title>¡REVISA TU EMAIL!</TextStyle>
            <TextStyle small color="main2">
              Para concluir por favor introduce el codigó de verificación que te
              enviamos a tu correo electrónico
            </TextStyle>
          </View>
          <View style={styles.verificationCodeContainer}>
            {codeDigitsArray.map(toCodeDigitInput)}
          </View>
          <TextInput
            style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
            maxLength={6}
            value={code}
            onChangeText={(text) => !/[^0-9]/g.test(text) && setCode(text)}
            keyboardType="numeric"
            returnKeyType="done"
            textContentType="oneTimeCode"
            ref={textInputRef}
            onBlur={handleBlur}
          />
        </View>
        <Image source={CheckEmail} style={{ width: "100%", height: 300 }} />
        <View style={{ marginTop: 40 }}>
          <TextStyle>¿Escribiste bien el correo electronico?</TextStyle>
          <View style={{ marginTop: 10 }}>
            <InputStyle
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(email) => setEmail(email)}
            />
            <ButtonStyle
              customButtonStyle={{
                opacity:
                  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(
                    email
                  ) && email !== data.email
                    ? 1
                    : 0.5,
              }}
              onPress={() => {
                if (
                  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(
                    email
                  ) &&
                  email !== data.email
                ) {
                  setNotificationOptions({
                    type: "success",
                    title: "Correo enviado satisfactoriamente",
                    componentRight: () => (
                      <Ionicons
                        name="send-outline"
                        color={theme.colors.main4}
                        size={25}
                      />
                    ),
                  });

                  setNotificationActive(true);
                  setData({ ...data, email });
                }
              }}
            >
              Reenviar
            </ButtonStyle>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  verificationCodeContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationCode: {
    width: 45,
    height: 45,
    color: theme.colors.colorTextLight,
    borderRadius: 10,
    paddingTop: 6,
    marginHorizontal: 5,
  },
});

export default ConfirmEmail;
