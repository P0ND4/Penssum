import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

import TextStyle from "../../../../components/TextStyle";

import Teacher from "../../../../assets/resource/selection/teacher.png";
import Student from "../../../../assets/resource/selection/student.png";

const Information = ({
  setProgress,
  setProgressSetting,
  progressSetting,
  information,
  data,
  setData,
}) => {
  return (
    <View>
      <TextStyle title>¿QUIEN ERES?</TextStyle>
      <TextStyle small color="main2">
        !Genial! ahora dinos a que rama perteneces
      </TextStyle>
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setData({ ...data, objetive: "Profesor" });
            setProgress(3);
            setProgressSetting({
              ...progressSetting,
              width: 300,
              steps: information === "email" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
            });
          }}
        >
          <Image source={Teacher} style={styles.imageCard} />
          <TextStyle>Profesor</TextStyle>
          <TextStyle small color="main2">
            Publique sus servicios como profesor.
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setData({ ...data, objetive: "Alumno" });
            setProgress(3);
            setProgressSetting({
              ...progressSetting,
              width: 200,
              steps: information === "email" ? [1, 2, 3, 4] : [1, 2, 3],
            });
          }}
        >
          <Image source={Student} style={styles.imageCard} />
          <TextStyle>Alumno</TextStyle>
          <TextStyle small color="main2">
            Busque profesores que enseñen lo que necesite.
          </TextStyle>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageCard: {
    width: 240,
    height: 170,
  },
  card: {
    padding: 20,
    width: 280,
    backgroundColor: "#FFFFFF",
    marginVertical: 5,
    borderRadius: 10,
  },
});

export default Information;
