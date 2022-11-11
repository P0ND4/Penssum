import { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableNativeFeedback,
} from "react-native";
import { useSelector } from "react-redux";

import { socket } from "../../../../api";

import TextStyle from "../../../../components/TextStyle";
import InputStyle from "../../../../components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../../../../theme";

const Messages = ({ route }) => {
  const user = useSelector((state) => state.user);
  const { contactKey, idUser } = route.params;
  const { messages, currentBlock, fullName } = useSelector((state) =>
    state.contacts.find((contact) => contact.key === contactKey)
  );

  const [text, setText] = useState("");
  const [isBlocked, setIsBlocked] = useState({
    blocked: false,
    userView: null,
  });

  const socketRef = useRef(socket);

  useEffect(() => {
    if (currentBlock.length > 0) {
      setIsBlocked({
        blocked: true,
        userView: currentBlock[0].from === user._id ? "from" : "to",
      });
    } else {
      setIsBlocked({
        blocked: false,
        userView: null,
      });
    }
  }, [currentBlock]);

  useEffect(() => {
    socketRef.current.emit("revised-message", {
      contact_key: contactKey,
      user_id: user._id,
    });
  }, []);

  useEffect(() => {
    socketRef.current.on("block", () =>
      socketRef.current.emit("get_contact", user._id)
    );
    socketRef.current.on("unlocked", () =>
      socketRef.current.emit("get_contact", user._id)
    );

    return () => {
      socketRef.current.off("block");
      socketRef.current.off("unlocked");
    };
  }, []);

  useEffect(() => {
    socketRef.current.on("messages-updated", () =>
      socketRef.current.emit("get_contact", user._id)
    );
    socketRef.current.on("refresh_message", () =>
      socketRef.current.emit("get_contact", user._id)
    );

    return () => {
      socketRef.current.off("messages-updated");
      socketRef.current.off("refresh_message");
    };
  }, []);

  const sendMessage = () => {
    setText("");
    if (text !== "") {
      socketRef.current.emit("send_message", user._id, idUser, text);
    };
  };

  const defineUser = (transmitter, receiver) => {
    if (transmitter === "date" || receiver === "date") {
      return "date";
    } else if (transmitter === user._id) {
      return "user-two";
    } else if (receiver === user._id) {
      return "user-one";
    }

    return;
  };

  const getHoursAndMinutes = (message) => {
    const date = new Date(message.creationDate);

    let hours = date.getHours();

    const AMPM = hours >= 12 ? "p. m." : "a. m.";

    let minutes = ("0" + date.getMinutes()).slice(-2);

    return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${AMPM}`;
  };

  const Organizer = ({ message }) => {
    return (
      <View>
        {defineUser(message.transmitter, message.receiver) === "date" && (
          <TextStyle customStyle={styles.day} color="white">
            {message.message}
          </TextStyle>
        )}
        {defineUser(message.transmitter, message.receiver) !== "date" && (
          <View
            key={message.id}
            style={
              defineUser(message.transmitter, message.receiver) === "user-two"
                ? { alignItems: "flex-end" }
                : {}
            }
          >
            <View
              style={[
                styles.message,
                defineUser(message.transmitter, message.receiver) === "user-two"
                  ? { backgroundColor: "#26333b" }
                  : { backgroundColor: "#38454d" },
              ]}
            >
              <TextStyle justify small color="white">
                {message.message}
              </TextStyle>
              <TextStyle
                customStyle={[
                  styles.hourAndMinute,
                  { right: message.transmitter === user._id ? 28 : 5 },
                ]}
              >
                {getHoursAndMinutes(message)}
              </TextStyle>
              {message.transmitter === user._id && (
                <Ionicons
                  name="checkmark-done-outline"
                  color={message.view ? "#3282B8" : "#BBBBBB"}
                  size={18}
                  style={styles.isCheckedMessage}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.main1 }}>
      <FlatList
        inverted
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        overScrollMode="never"
        style={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => <Organizer message={item} />}
      />

      {!isBlocked.blocked ? (
        fullName.username !== "Admin" &&
        fullName.username !== undefined && (
          <View style={styles.formContainer}>
            <InputStyle
              value={text}
              onChangeText={(text) => setText(text)}
              placeholder="Mensaje"
              multiline
              customStyleInput={{ width: "85%" }}
            />
            <TouchableNativeFeedback onPress={() => sendMessage()}>
              <View style={styles.send}>
                <Ionicons name="send" color={theme.colors.main4} size={24} />
              </View>
            </TouchableNativeFeedback>
          </View>
        )
      ) : (
        <TextStyle
          color="white"
          customStyle={{ marginBottom: 30, marginTop: 20 }}
        >
          {isBlocked.userView === "from"
            ? "Has bloqueado a este usuario"
            : "Este usuario te ha bloqueado"}
        </TextStyle>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    width: "80%",
    marginVertical: 10,
    position: "relative",
    padding: 12,
    borderRadius: 5,
  },
  hourAndMinute: {
    position: "absolute",
    fontSize: 14,
    color: "#888888",
    bottom: 7,
  },
  isCheckedMessage: {
    position: "absolute",
    right: 5,
    bottom: 4,
  },
  day: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: theme.colors.main4,
    borderRadius: 5,
  },
  formContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  send: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: theme.colors.main2,
  },
});

export default Messages;
