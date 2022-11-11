import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Checkbox from "expo-checkbox";

import TextStyle from "../../../../components/TextStyle"; // Estilos prefabricados
import InputStyle from "../../../../components/InputStyle"; // Estilos prefabricados
import ButtonStyle from "../../../../components/ButtonStyle"; // Estilos prefabricados

import { loginUser } from "../../../../api";

import theme from "../../../../theme";

const Basic = ({ progress, setProgress, data, setData, information }) => {
  const [terms, setTerms] = useState(false);

  return (
    <KeyboardAwareScrollView>
      <TextStyle title>¡REGÍSTRATE!</TextStyle>
      <TextStyle small color="main2">
        Antes de empezar necesitamos obtener algunos datos inciales para poder
        regístrarte.
      </TextStyle>
      <View style={{ marginTop: 20 }}>
        <InputStyle
          value={data.email}
          onChangeText={(email) => setData({ ...data, email })}
          keyboardType="email-address"
          placeholder="Correo electrónico"
          editable={information !== 'social'}
          selectTextOnFocus={information !== 'social'}
          disabled={information === 'social'}
        />
        <InputStyle
          value={data.password}
          placeholder="Contraseña"
          maxLength={30}
          onChangeText={(password) => setData({ ...data, password })}
          secureTextEntry
        />
        <View style={styles.checkBoxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={terms}
            onValueChange={() => setTerms(!terms)}
            color={terms ? theme.colors.main2 : undefined}
          />
          <TextStyle
            small
            left
            customStyle={{ marginHorizontal: 10, width: "80%" }}
            onPress={() => setTerms(!terms)}
          >
            He leído y acepto los Términos de servicio y la Política de
            privacidad de Penssum.
          </TextStyle>
        </View>
        <ButtonStyle
          customButtonStyle={{
            opacity:
              /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(
                data.email
              ) &&
              /^.{6,30}$/.test(data.password) &&
              terms
                ? 1
                : 0.5,
          }}
          onPress={async () => {
            if (
              /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(
                data.email
              ) &&
              /^.{6,30}$/.test(data.password) &&
              terms
            ) {
              const result = await loginUser({
                email: data.email,
                password: "||test = {{||test-test||}} = test||",
              });
          
              if (result.error && result.type === 'User not found') {
                if (progress === 3) setProgress(1);
                else setProgress(progress + 1);
              } else Alert.alert('Opps','Cuenta ya registrada');
            }
          }}
        >
          Siguiente
        </ButtonStyle>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  checkBoxContainer: {
    marginVertical: 20,
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "center",
  },
  checkbox: {
    padding: 10,
    borderRadius: 6,
  },
});

export default Basic;
