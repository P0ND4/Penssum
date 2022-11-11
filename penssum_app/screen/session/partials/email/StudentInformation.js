import { View, Image } from "react-native";

import TextStyle from "../../../../components/TextStyle"; // Estilos prefabricados
import InputStyle from "../../../../components/InputStyle"; // Estilos prefabricados
import ButtonStyle from "../../../../components/ButtonStyle"; // Estilos prefabricados

import Colombia from "../../../../assets/resource/countries/colombia.png"; //Mapa de colombia

import { useNavigation } from "@react-navigation/native";

const StudentInformation = ({ setProgress, data, setData, information, subjects, tags }) => {
  const navigation = useNavigation();

  return (
    <View>
      <TextStyle title>¡ERES ESTUDIANTE!</TextStyle>
      <TextStyle small color="main2">
        Ya casi estamos terminando necesitamos estos últimos datos para crear tu
        cuenta.
      </TextStyle>
      <View style={{ marginTop: 20 }}>
        <InputStyle
          placeholder="Nombre"
          value={data.firstName}
          maxLength={16}
          onChangeText={(name) => setData({ ...data, firstName: name })}
        />
        <InputStyle
          placeholder="Apellido"
          value={data.lastName}
          maxLength={16}
          onChangeText={(lastName) => setData({ ...data, lastName })}
        />
        <InputStyle
          value={data.phoneNumber}
          onChangeText={(number) => setData({ ...data, phoneNumber: number })}
          maxLength={20}
          componentLeft={() => (
            <View
              style={{
                flexDirection: "row",
                paddingLeft: 20,
                alignItems: "center",
              }}
            >
              <Image source={Colombia} style={{ width: 30, height: 30 }} />
              <TextStyle paragrahp customStyle={{ marginLeft: 10 }}>
                +57
              </TextStyle>
            </View>
          )}
          keyboardType="numeric"
          placeholder="Número de teléfono"
        />
        <ButtonStyle
          customButtonStyle={{
            opacity:
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.lastName) &&
              /^[0-9]{5,20}$/.test(data.phoneNumber)
                ? 1
                : 0.5,
          }}
          onPress={() => {
            if (
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.lastName) &&
              /^[0-9]{5,20}$/.test(data.phoneNumber)
            ) {
              if (information === "social") {
                const currentData = data;

                currentData.specialty = {
                  subjects: subjects.join(", "),
                  topics: tags.join(", "),
                };
                
                navigation.push("Username", { data: currentData });
              } else setProgress(4);
            }
          }}
        >
          Siguiente
        </ButtonStyle>
      </View>
    </View>
  );
};

export default StudentInformation;
