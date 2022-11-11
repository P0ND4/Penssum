import { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableNativeFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { markUncheckedMessages, socket } from "../../api";

import TextStyle from "../../components/TextStyle";
import theme from "../../theme";

import NoProfilePicture from "../../assets/noProfilePicture.png";
import Logo from "../../assets/icon.png";
import { update } from "../../helpers/features/user/contactsSlice";

const Messages = ({ setCountInMessages, stackNavigation }) => {
  const user = useSelector((state) => state.user);
  const contacts = useSelector((state) => state.contacts);
  const [idUser, setIdUser] = useState("");
  const [contactKey, setContactKey] = useState("");

  const socketRef = useRef(socket);

  const dispatch = useDispatch();

  useEffect(() => {
    socketRef.current.emit("get_contact", user._id);
    setCountInMessages(0);
    markUncheckedMessages(user._id);

    return () => {
      socketRef.current.off();
    };
  }, []);

  useEffect(() => {
    socketRef.current.on("contacts", (contactsObtained) =>
      dispatch(update(contactsObtained))
    );
    socketRef.current.on("new_message", ({ contact, senderId }) => {
      if (idUser === senderId) {
        socketRef.current.emit("revised-message", {
          contact_key: contactKey,
          user_id: user._id,
        });
      }
      socketRef.current.emit("get_contact", user._id);
    });

    socketRef.current.on("block", () => socketRef.current.emit("get_contact", user._id));
    socketRef.current.on("unlocked", () => socketRef.current.emit("get_contact", user._id));

    return () => {
      socketRef.current.off('contacts');
      socketRef.current.off('new_message');
      socketRef.current.off('block');
      socketRef.current.off('unlocked');
    };
  },[idUser]);

  const getHoursAndMinutes = (message) => {
    const date = new Date(message.creationDate);

    let hours = date.getHours();

    const AMPM = hours >= 12 ? "p. m." : "a. m.";

    let minutes = ("0" + date.getMinutes()).slice(-2);

    return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${AMPM}`;
  };

  //onLongPress={() => alert('HOLA')} // PARA EL BOTON AL DEJAR PRECIONADO

  const defineName = (item) => {
    const name =
      item.fullName.firstName === undefined ||
      item.fullName.firstName === "" ||
      item.fullName.firstName === null
        ? item.fullName.username === undefined ||
          item.fullName.username === null
          ? "ELIMINADO"
          : item.fullName.username.slice(0, 14) + "..."
        : `${item.fullName.firstName.slice(0, 10)} .${
            item.fullName.lastName === undefined
              ? ""
              : item.fullName.lastName.slice(0, 1)
          }`;

    return name;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.main1 }}>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const messages = item.messages;

          return (
            <TouchableNativeFeedback
              onPress={() => {
                stackNavigation.push("Messages", {
                  firstName: item.fullName.username,
                  name: defineName(item),
                  profilePicture: item.profilePicture,
                  contactKey: item.key,
                  idUser: item.contraryIdentifier,
                  setIdUser
                });
                setIdUser(item.contraryIdentifier);
                setContactKey(item.key);
              }}
            >
              <View style={styles.container}>
                <View style={styles.information}>
                  <Image
                    source={
                      item.profilePicture === null ||
                      item.profilePicture === "" ||
                      item.profilePicture === undefined ||
                      item.profilePicture === "Admin"
                        ? item.profilePicture === "Admin"
                          ? Logo
                          : NoProfilePicture
                        : { uri: item.profilePicture }
                    }
                    style={styles.image}
                  />
                  <View style={{ alignItems: "flex-start" }}>
                    <TextStyle paragrahp customStyle={{ color: "#DDDDDD" }}>
                      {defineName(item)}
                    </TextStyle>
                    <TextStyle
                      small
                      customStyle={{
                        color:
                          !messages[messages.length - 1].view &&
                          messages[messages.length - 1].receiver === user._id
                            ? "#FFFFFF"
                            : "#AAAAAA",
                        fontWeight:
                          !messages[messages.length - 1].view &&
                          messages[messages.length - 1].receiver === user._id
                            ? "600"
                            : "",
                      }}
                    >
                      {messages[messages.length - 1].message.slice(0, 25)}
                      {messages[messages.length - 1].message.length > 25
                        ? "..."
                        : ""}
                    </TextStyle>
                  </View>
                </View>
                <View style={styles.extraInformation}>
                  <TextStyle
                    customStyle={{
                      fontSize: 14,
                      color:
                        item.noChecked > 0 ? theme.colors.main2 : "#DDDDDD",
                    }}
                  >
                    {getHoursAndMinutes(messages[messages.length - 1])}
                  </TextStyle>
                  {item.noChecked > 0 && (
                    <TextStyle
                      small
                      customStyle={styles.noChecked}
                      color="white"
                    >
                      {item.noChecked}
                    </TextStyle>
                  )}
                </View>
              </View>
            </TouchableNativeFeedback>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 15,
    height: 80,
  },
  information: {
    flexDirection: "row",
    alignItems: "center",
  },
  extraInformation: {
    alignItems: "flex-end",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#DDDDDD",
  },
  noChecked: {
    width: 26,
    height: 26,
    backgroundColor: theme.colors.main2,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 3,
    borderRadius: 13,
    marginTop: 4,
  },
});

export default Messages;
