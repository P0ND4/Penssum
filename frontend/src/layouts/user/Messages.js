import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Howl } from "howler";
import {
  socket,
  markUncheckedMessages,
} from "../../api";
import Cookies from "universal-cookie";

import messageSound from "../../source/Message.mp3";

import Loading from "../../components/Loading";
import {
  changeMessages,
  changeContacts,
  change,
} from "../../features/user/messagesContentSlice";

import { useNotificationSocket } from "../../helpers/socketHandler";
import ContactScreen from "../../screens/messages/ContactScreen";
import InputForm from "../../screens/messages/InputForm";
import Header from "../../screens/messages/Header";
import Content from "../../screens/messages/Content";

const cookies = new Cookies();

function Messages() {
  const { messages, contacts, contactActive } = useSelector(
    (state) => state.messagesContent
  );

  const dispatch = useDispatch();
  const socketRef = useRef(socket);
  const contactId = useRef(null);

  useNotificationSocket();

  useEffect(() => {
    if (contactActive !== null) {
      const contact = contacts.find(
        (contact) => contact.key === contactActive.key
      );

      dispatch(changeMessages(contact.messages));
    }
  }, [contactActive, contacts, dispatch]);

  useEffect(() => {
    if (contactActive !== null && contactActive.idUser !== contactId.current) {
      contactId.current = contactActive.idUser;

      socketRef.current.emit("revised-message", {
        contact_key: contactActive.key,
        user_id: cookies.get("id"),
      });
    }
  }, [contactActive]);

  useEffect(() => {
    socketRef.current.emit("get_contact", cookies.get("id"));
    markUncheckedMessages(cookies.get("id"));
  }, []);

  useEffect(() => {
    const socket = socketRef.current;

    socketRef.current.on("contacts", (contactsObtained) =>
      dispatch(changeContacts(contactsObtained))
    );
    socketRef.current.on("messages-updated", ({ messages, senderId }) => {
      socketRef.current.emit("get_contact", cookies.get("id"));
      if (contactActive !== null && contactActive.idUser === senderId) {
        dispatch(changeMessages(messages));
      }
    });
    socketRef.current.on("refresh_message", ({ userID, canYouType }) => {
      if (contactActive !== null && contactActive.idUser === userID) {
        dispatch(change({ canYouType }));
      }
      socketRef.current.emit("get_contact", cookies.get("id"));
    });
    socketRef.current.on("new_message", ({ contact, senderId }) => {
      if (contactActive !== null && contactActive.idUser === senderId) {
        socketRef.current.emit("revised-message", {
          contact_key: contactActive.key,
          user_id: cookies.get("id"),
        });
        dispatch(changeMessages(contact.messages));
      } else {
        const sound = new Howl({
          src: messageSound,
        });

        sound.play();
      }
      socketRef.current.emit("get_contact", cookies.get("id"));
    });
    socketRef.current.on("block", (from) => {
      if (contactActive !== null && contactActive.idUser === from) {
        dispatch(change({ isBlocked: { blocked: true, userView: "to" } }));
      }
    });
    socketRef.current.on("unlocked", (from) => {
      if (contactActive !== null && contactActive.idUser === from) {
        dispatch(change({ isBlocked: { blocked: false, userView: null } }));
      }
    });

    return () => socket.off();
  });

  useEffect(() => {
    if (document.querySelector(".messages"))
      document.querySelector(".messages").scrollTop = "9999999999";
  }, [messages]);

  return (
    <div className="messages-container">
      {contacts === null ? (
        <Loading
          size={100}
          margin="auto"
          optionText={{
            text: "...RECOLECTANDO MENSAJES...",
            colorText: "#333333",
            fontSize: "26px",
          }}
        />
      ) : (
        <div className="inbox">
          <ContactScreen />
          {messages.length > 0 && (
            <div className="message">
              <Header />
              <Content />
              <InputForm />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;
