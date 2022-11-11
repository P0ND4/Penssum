import {
  View,
  StyleSheet,
  ScrollView,
  TouchableNativeFeedback,
} from "react-native";

import TextStyle from "../../../../components/TextStyle"; // Estilos prefabricados
import ButtonStyle from "../../../../components/ButtonStyle"; // Estilos prefabricados

import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../../../../theme";

const SelectionOfSubjects = ({
  setProgress,
  subjects,
  setSubjectsSelected,
  subjectsSelected,
}) => {
  function selectSubject(title) {
    if (subjectsSelected.length < 10 && !subjectsSelected.includes(title))
      setSubjectsSelected([...subjectsSelected, title]);
    else {
      const subjects = subjectsSelected.filter((subject) => subject !== title);
      setSubjectsSelected(subjects);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <TextStyle title>¡MATERIAS!</TextStyle>
        <TextStyle small color="main2">
          Elija hasta 10 materias que disfrute enseñar. Ésto nos va ayudar a
          recomendarlo con estudiantes.
        </TextStyle>
      </View>
      <ScrollView
        overScrollMode="never"
        style={{
          marginVertical: 20,
          width: "100%",
        }}
      >
        <View style={styles.container}>
          {subjects.map((subject) => {
            const titleChange = subject
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");

            return (
              <TouchableNativeFeedback
                key={titleChange}
                onPress={() => selectSubject(titleChange)}
              >
                <View
                  style={[
                    styles.subjects,
                    {
                      opacity: !subjectsSelected.includes(titleChange)
                        ? 1
                        : 0.8,
                    },
                  ]}
                >
                  <TextStyle paragrahp color="white">
                    {subject}
                  </TextStyle>
                  {subjectsSelected.includes(titleChange) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={30}
                      color={theme.colors.main2}
                      style={styles.mark}
                    />
                  )}
                </View>
              </TouchableNativeFeedback>
            );
          })}
        </View>
      </ScrollView>
      <ButtonStyle onPress={() => setProgress(5)}>Siguiente</ButtonStyle>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subjects: {
    width: "49%",
    height: 60,
    backgroundColor: theme.colors.main1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mark: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

export default SelectionOfSubjects;
