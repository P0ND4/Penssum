import { View, Image, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import TextStyle from "../../../../components/TextStyle"; // Estilos prefabricados
import InputStyle from "../../../../components/InputStyle"; // Estilos prefabricados
import ButtonStyle from "../../../../components/ButtonStyle"; // Estilos prefabricados

import Colombia from "../../../../assets/resource/countries/colombia.png"; //Mapa de colombia

import { thousandsSystem } from "../../../../helpers/index";

const TeacherInformation = ({ setProgress, data, setData }) => {
  return (
    <KeyboardAwareScrollView>
      <TextStyle title>¡ERES PROFESOR!</TextStyle>
      <TextStyle small color="main2">
        Rellene la siguiente información para poder continuar
      </TextStyle>
      <View style={{ marginTop: 20 }}>
        <View style={styles.row}>
          <InputStyle
            placeholder="Nombre"
            value={data.firstName}
            onChangeText={(name) =>
              setData({ ...data, firstName: name.trim() })
            }
            split={2}
            maxLength={16}
          />
          <InputStyle
            placeholder="Apellido"
            value={data.lastName}
            onChangeText={(lastName) =>
              setData({ ...data, lastName: lastName.trim() })
            }
            split={2}
            maxLength={16}
          />
        </View>
        <View style={styles.row}>
          <InputStyle
            placeholder="Segundo Nombre"
            value={data.secondName}
            maxLength={16}
            onChangeText={(name) =>
              setData({ ...data, secondName: name.trim() })
            }
            split={2}
          />
          <InputStyle
            placeholder="Segundo Apellido"
            value={data.secondSurname}
            maxLength={16}
            onChangeText={(secondSurname) =>
              setData({ ...data, secondSurname: secondSurname.trim() })
            }
            split={2}
          />
        </View>
        <InputStyle
          placeholder="Descripción"
          multiline
          maxLength={250}
          onChangeText={(description) => setData({ ...data, description })}
          value={data.description}
        />
        <InputStyle
          placeholder="Cédula De Identidad"
          value={thousandsSystem(data.identification)}
          maxLength={20}
          onChangeText={(identification) =>
            setData({
              ...data,
              identification: identification.split(".").join(""),
            })
          }
          keyboardType="numeric"
        />
        <InputStyle
          placeholder="Valor por hora"
          maxLength={15}
          value={thousandsSystem(data.valuePerHour)}
          onChangeText={(valuePerHour) =>
            setData({ ...data, valuePerHour: valuePerHour.split(".").join("") })
          }
          keyboardType="numeric"
        />
        <InputStyle
          value={data.phoneNumber}
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
          onChangeText={(number) => setData({ ...data, phoneNumber: number })}
          placeholder="Número de teléfono"
        />
        <ButtonStyle
          customButtonStyle={{
            opacity:
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.secondName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.lastName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(
                data.secondSurname
              ) &&
              /^[a-zA-ZA-ÿ-0-9#*\u00f1\u00d1\s!:,.;]{10,250}$/.test(
                data.description
              ) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[0-9]{5,20}$/.test(data.identification) &&
              /^[0-9]{1,20}$/.test(data.valuePerHour) &&
              /^[0-9]{5,20}$/.test(data.phoneNumber)
                ? 1
                : 0.5,
          }}
          onPress={() => {
            if (
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.secondName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.lastName) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(
                data.secondSurname
              ) &&
              /^[a-zA-ZA-ÿ-0-9#*\u00f1\u00d1\s!:,.;]{10,250}$/.test(
                data.description
              ) &&
              /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,16}$/.test(data.firstName) &&
              /^[0-9]{5,20}$/.test(data.identification) &&
              /^[0-9]{1,20}$/.test(data.valuePerHour) &&
              /^[0-9]{5,20}$/.test(data.phoneNumber)
            ) {
              setProgress(4);
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default TeacherInformation;
