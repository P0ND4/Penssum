import { useState } from "react";
import { View, TextInput, StyleSheet, ScrollView } from "react-native";
import ButtonStyle from "./ButtonStyle";
import TextStyle from "./TextStyle";

import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../theme";

const Tags = ({ tags, setTags }) => {
  const [text, setText] = useState("");

  const changeTags = (e) => {
    let tag = text.replace(/\s+/g, " ").trimLeft().trimRight(); // Remplazar todos los espacios con uno solo
    if (tag.length > 0) {
      if (tags.length < 100) {
        let currentTags = [...tags];
        tag
          .split(",")
          .map(
            (tag) =>
              tag !== "" &&
              !tags.includes(tag) &&
              currentTags.push(tag.slice(0, 40))
          );
        setTags(currentTags);
      }
      setText("");
    }
  };

  return (
    <View>
      <View style={{ justifyContent: 'center' }}>
        <TextStyle small>
          Preciona "ENTER" o añade una coma despues de cada etiqueta
        </TextStyle>
        <View style={{ maxHeight: 400 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          >
            <View style={styles.listContent}>
              {tags.map((tag, index) => (
                <View style={styles.list} key={index}>
                  <TextStyle paragrahp key={tag + index}>
                    {tag}{" "}
                  </TextStyle>
                  <Ionicons
                    name="close-circle-outline"
                    onPress={() => {
                      setTags(tags.filter((currentTag) => currentTag !== tag));
                    }}
                    style={styles.icon}
                  />
                </View>
              ))}
              <TextInput
                value={text}
                onChangeText={(e) => setText(e)}
                onSubmitEditing={changeTags}
                cursorColor={theme.colors.colorTextLight}
                style={styles.input}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextStyle small>
          <TextStyle color="main2">{100 - tags.length}</TextStyle> Etiquetas
          faltantes
        </TextStyle>
        <ButtonStyle
          onPress={() => setTags([])}
          backgroundColor="main3"
          customButtonStyle={{ borderRadius: 5 }}
          split={2}
        >
          Remover Todo
        </ButtonStyle>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    borderColor: theme.colors.colorTextLight,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginVertical: 12,
    flexWrap: "wrap",
  },
  list: {
    marginVertical: 4,
    marginHorizontal: 3,
    backgroundColor: "#EEEEEE",
    borderRadius: 5,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 8,
    borderColor: theme.colors.colorTextLight,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 25,
    color: theme.colors.colorTextLight,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    padding: 5,
  },
});

export default Tags;
