import { View } from "react-native";

import TextStyle from "../../../../components/TextStyle";
import ButtonStyle from "../../../../components/ButtonStyle";

import Tags from "../../../../components/Tags";

import { useNavigation } from "@react-navigation/native";

const SelectionOfTopics = ({
  setProgress,
  tags,
  setTags,
  information,
  data,
  subjects,
}) => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <TextStyle title>¡TEMAS!</TextStyle>
        <TextStyle small color="main2">
          Escriba los temas que da en cada materia. Esto es principal para que
          aparezca en la barra de búsqueda.
        </TextStyle>
      </View>
      <Tags tags={tags} setTags={setTags} />
      <ButtonStyle
        onPress={() => {
          if (information === "social") {
            const currentData = data;

            currentData.specialty = {
              subjects: subjects.join(", "),
              topics: tags.join(", "),
            };

            navigation.push("Username", { data: currentData });
          } else setProgress(6);
        }}
      >
        Siguiente
      </ButtonStyle>
    </View>
  );
};

export default SelectionOfTopics;
