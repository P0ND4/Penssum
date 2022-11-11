import { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  TouchableNativeFeedback,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { update } from "../../helpers/features/post/postSlice";
import { getProducts } from "../../api";
import { thousandsSystem, changeDate } from "../../helpers";

import * as WebBrowser from "expo-web-browser";

import Ionicons from "@expo/vector-icons/Ionicons";

import TextStyle from "../../components/TextStyle";
import ButtonStyle from "../../components/ButtonStyle";

import { takePost, removeTakePost, socket } from "../../api";

import theme from "../../theme";

const Home = () => {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.post);

  const dispatch = useDispatch();

  const socketRef = useRef(socket);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const products = async () => {
      const result = await getProducts();

      dispatch(update(result));
    };

    products();
  }, []);

  const engage = ({ post_id }) => {
    Alert.alert(
      "¿Quieres postular a la publicación?",
      "¿Te comprometes a culminar la publicación en el tiempo solicitado, teniendo en cuenta la calidad del trabajo? de eso dependerá su experiencia y su calificación, para que más estudiantes lo recomienden.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            const result = await takePost({ post_id, teacher_id: user._id });

            if (result.error) {
              if (result.type === "this post has been taken") {
                Alert.alert(
                  '"ERROR"',
                  '"La publicación ya lo tomó un profesor"',
                  [{ text: "OK" }]
                );
              }
              if (result.type === "maximum products taken") {
                Alert.alert(
                  '"ERROR"',
                  '"Alcanzaste el límite de publicaciones, resuelve las publicaciones que seleccionaste para poder tomar una publicación."',
                  [{ text: "OK" }]
                );
              }
            } else {
              socketRef.current.emit("received event", result.owner);
              socketRef.current.emit("product updated", {
                userID: result.owner,
                post_id,
                globalProductUpdate: true,
              });
            }
            const products = await getProducts();

            dispatch(update(products));
          },
        },
      ]
    );
  };

  const removeTake = ({ post_id, owner }) => {
    Alert.alert(
      "¿Quieres renunciar?",
      "¿Puedes renunciar a la publicación cuando quieras, pero por favor no lo hagas el mísmo día de la entrega, porque podría llevar a la suspención de su cuenta, y ser reportado a nuestró moderadores.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: async () => {
            const result = await removeTakePost({
              post_id,
              typeOfUser: "teacher",
              user_id: user._id,
            });

            if (result.error) {
              Alert.alert(
                "Error",
                "El estudiante de la publicación ya te expulsó.",
                [{ text: "OK" }]
              );
            } else {
              socket.emit("received event", owner);
              socket.emit("product updated", {
                userID: owner,
                product: result,
                globalProductUpdate: true,
              });
            }
            const products = await getProducts();

            dispatch(update(products));
          },
        },
      ]
    );
  };

  return (
    <View>
      <Animated.FlatList
        data={products}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        overScrollMode="never"
        renderItem={({ item, index }) => {
          const inputRange = [-1, 0, 138 * index, 138 * (index + 1.8)];

          const opacityInputRange = [-1, 0, 138 * index, 138 * (index + 0.8)];

          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 1, 0],
          });

          const opacity = scrollY.interpolate({
            inputRange: opacityInputRange,
            outputRange: [1, 1, 1, 0],
          });

          return (
            <TouchableNativeFeedback
              onPress={async () =>
                await WebBrowser.openBrowserAsync(
                  `https://penssum.com/post/information/${item._id}`
                )
              }
            >
              <Animated.View
                style={[styles.card, { transform: [{ scale }], opacity }]}
              >
                <Image
                  source={{ uri: item.linkMiniature /*IMAGEN DEL ALUMNO*/ }}
                  style={styles.image}
                />
                <View style={styles.content}>
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
                        width: 120,
                        backgroundColor: theme.colors.main3,
                        borderRadius: 25,
                      }}
                    >
                      Valor: ${thousandsSystem(item.valueNumber)}
                    </TextStyle>
                    {!item.takenBy && user.objetive !== "Alumno" && (
                      <ButtonStyle
                        customButtonStyle={{ paddingVertical: 5, width: 120 }}
                        onPress={() => engage({ post_id: item._id })}
                      >
                        <TextStyle small color="white">
                          Postularse
                        </TextStyle>
                      </ButtonStyle>
                    )}
                    {user._id === item.takenBy && (
                      <ButtonStyle
                        customButtonStyle={{
                          paddingVertical: 5,
                          width: 120,
                          backgroundColor: theme.colors.main1,
                        }}
                        onPress={() => removeTake({ post_id: item._id, owner: item.owner })}
                      >
                        <TextStyle small color="white">
                          Renunciar
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
              </Animated.View>
            </TouchableNativeFeedback>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  content: {
    maxWidth: "70%",
  },
  taken: {
    position: "absolute",
    right: 0,
    top: 0,
  },
});

export default Home;
