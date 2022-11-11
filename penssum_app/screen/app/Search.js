import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableNativeFeedback,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import * as WebBrowser from "expo-web-browser";

import Ionicons from "@expo/vector-icons/Ionicons";

import TextStyle from "../../components/TextStyle";
import InputStyle from "../../components/InputStyle";
import ButtonStyle from "../../components/ButtonStyle";

import { update } from "../../helpers/features/helpers/usersSlice";
import { filterProducts, getUsers } from "../../api";

import NoProfilePicure from "../../assets/noProfilePicture.png";

import { thousandsSystem, changeDate } from "../../helpers/index";

import theme from "../../theme";

const Search = () => {
  const [search, setSearch] = useState("");
  const user = useSelector((state) => state.user);

  const users = useSelector((state) => state.users);
  const products = useSelector((state) => state.post);

  const [dataToShow, setDataToShow] = useState([]);

  const dispatch = useDispatch();

  const allUsers = async () => {
    const usersObtained = await getUsers();

    const teachers = [];

    for (let user of usersObtained) {
      if (user.objetive === "Profesor") teachers.push(user);
    }

    dispatch(update(teachers));
    setDataToShow(teachers);
  };

  useEffect(() => {
    const filter = [];

    if (user.objetive === "Alumno") {
      for (let user of users) {
        if (
          (user.firstName.includes(search) ||
            user.secondName.includes(search) ||
            user.lastName.includes(search) ||
            user.secondSurname.includes(search) ||
            user.username.includes(search) ||
            user.faculties.includes(search) ||
            user.email.includes(search) ||
            user.specialty.subjects.includes(search) ||
            user.specialty.topics.includes(search)) &&
          filterProducts.length <= 15
        ) {
          filter.push(user);
        }
      }
    } else {
      for (let product of products) {
        if (
          (product.creatorUsername.includes(search) ||
            product.subCategory.includes(search) ||
            product.category.includes(user.firstName.includes(search)) ||
            product.customCategory.includes(search) ||
            product.title.includes(search) ||
            product.description.includes(search)) &&
          filterProducts.length <= 15
        ) {
          filter.push(product);
        }
      }
    }

    setDataToShow(filter);
  }, [search]);

  useEffect(() => {
    if (user.objetive === "Alumno") allUsers();
  }, []);

  const name = (firstName, lastName, username) => {
    if (firstName === "" && lastName === "") {
      return username;
    } else {
      return `${firstName} ${lastName}`;
    }
  };

  return (
    <View style={[theme.styles.container, { marginTop: 0 }]}>
      <InputStyle
        componentLeft={() => (
          <Ionicons
            name="search"
            size={26}
            style={{ marginLeft: 14 }}
            color={theme.colors.colorTextLight}
          />
        )}
        onChangeText={setSearch}
        placeholder={
          user.objetive === "Alumno"
            ? "Encuentra profesores"
            : "Encuentra publicaciones"
        }
      />
      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item._id}
        overScrollMode="never"
        initialNumToRender={5}
        renderItem={({ item }) =>
          user.objetive === "Alumno" ? (
            <TouchableNativeFeedback
              onPress={async () =>
                await WebBrowser.openBrowserAsync(
                  `https://penssum.com/${item.username}`
                )
              }
            >
              <View style={styles.container}>
                <Image
                  source={
                    item.profilePicture
                      ? { uri: item.profilePicture }
                      : NoProfilePicure
                  }
                  style={styles.profileImage}
                />
                <View style={styles.content}>
                  <TextStyle subtitle>
                    {name(item.firstName, item.lastName, item.username)}
                  </TextStyle>
                  <TextStyle small>{item.description}</TextStyle>
                </View>
                {item.valuePerHour && (
                  <TextStyle>
                    Valor:{" "}
                    <TextStyle color="main2">
                      ${thousandsSystem(item.valuePerHour)}
                    </TextStyle>
                  </TextStyle>
                )}
              </View>
            </TouchableNativeFeedback>
          ) : (
            <TouchableNativeFeedback
              onPress={async () =>
                await WebBrowser.openBrowserAsync(
                  `https://penssum.com/post/information/${item._id}`
                )
              }
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: item.linkMiniature }}
                  style={styles.image}
                />
                <View style={{ maxWidth: "70%" }}>
                  <TextStyle justify paragrahp>
                    {item.title}
                  </TextStyle>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 5,
                    }}
                  >
                    <TextStyle justify small color="main2">
                      {item.category}
                    </TextStyle>
                    <TextStyle justify small color="main2">
                      <TextStyle small>Para: </TextStyle>{" "}
                      {changeDate(item.dateOfDelivery)}
                    </TextStyle>
                  </View>
                  <TextStyle justify customStyle={{ fontSize: 14 }}>
                    {item.description}
                  </TextStyle>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TextStyle
                      small
                      color="white"
                      customStyle={{
                        paddingVertical: 5,
                        width: 110,
                        backgroundColor: theme.colors.main3,
                        borderRadius: 25,
                      }}
                    >
                      ${thousandsSystem(item.valueNumber)}
                    </TextStyle>
                    {!item.takenBy && (
                      <ButtonStyle
                        customButtonStyle={{ paddingVertical: 5, width: 110 }}
                      >
                        <TextStyle small color="white">
                          Postular
                        </TextStyle>
                      </ButtonStyle>
                    )}
                  </View>
                </View>
                {item.takenBy && (
                  <Ionicons
                    name="checkmark-circle"
                    size={40}
                    color={theme.colors.main2}
                    style={styles.taken}
                  />
                )}
              </View>
            </TouchableNativeFeedback>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  content: { marginVertical: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    padding: 10,
    margin: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 45,
    marginRight: 15,
  },
  taken: {
    position: "absolute",
    right: 0,
    top: 0,
  },
});

export default Search;
