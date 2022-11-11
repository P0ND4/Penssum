import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  socket,
  markUncheckedMessages,
  getProducts,
  getNotifications,
  blockUser,
} from "../../../api";
import swal from "sweetalert";
import Cookies from "universal-cookie";
import Contact from "../../parts/Contact";

import Loading from "../../parts/Loading";

const cookies = new Cookies();

function Messages({ setProducts, setNotifications, setCountInNotification }) {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState(null);
  const [contactActive, setContactActive] = useState(null);
  const [isBlocked, setIsBlocked] = useState({
    blocked: false,
    userView: null,
  });
  const [isActiveContact, setIsActiveContact] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  const changeWidth = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => window.removeEventListener("resize", changeWidth);
  });

  useEffect(() => {
    if (contactActive !== null) {
      const contact = contacts.find(
        (contact) => contact.key === contactActive.key
      );

      setMessages(contact.messages);
    }
  }, [contactActive, contacts]);

  useEffect(() => {
    if (contactActive !== null) {
      socket.emit("revised-message", {
        contact_key: contactActive.key,
        user_id: cookies.get("id"),
      });
    }
  }, [contactActive]);

  useEffect(() => {
    socket.emit("get_contact", cookies.get("id"));
    markUncheckedMessages(cookies.get("id"));

    return () => {
      socket.off();
    };
  }, []);

  const searchNotifications = useCallback(async () => {
    const briefNotifications = await getNotifications(cookies.get("id"));

    const currentNotification = [];
    let count = 0;

    for (let i = 0; i < 3; i++) {
      if (briefNotifications[i] !== undefined)
        currentNotification.push(briefNotifications[i]);
    }
    for (let i = 0; i < briefNotifications.length; i++) {
      if (!briefNotifications[i].view) count += 1;
    }

    setCountInNotification(count);
    setNotifications(currentNotification);
  }, [setCountInNotification, setNotifications]);

  useEffect(() => {
    socket.on("contacts", (contactsObtained) => setContacts(contactsObtained));
    socket.on("messages-updated", ({ messages, senderId }) => {
      socket.emit("get_contact", cookies.get("id"));
      if (contactActive !== null && contactActive.idUser === senderId) {
        setMessages(messages);
      }
    });
    socket.on("refresh_message", () =>
      socket.emit("get_contact", cookies.get("id"))
    );
    socket.on("new_message", ({ contact, senderId }) => {
      if (contactActive !== null && contactActive.idUser === senderId) {
        socket.emit("revised-message", {
          contact_key: contactActive.key,
          user_id: cookies.get("id"),
        });
        setMessages(contact.messages);
      }
      socket.emit("get_contact", cookies.get("id"));
    });
    socket.on("block", (from) => {
      if (contactActive !== null && contactActive.idUser === from) {
        setIsBlocked({ blocked: true, userView: "to" });
      }
    });
    socket.on("unlocked", (from) => {
      if (contactActive !== null && contactActive.idUser === from) {
        setIsBlocked({ blocked: false, userView: null });
      }
    });
    socket.on("received event", async () => await searchNotifications());

    return () => {
      socket.off();
    };
  });

  useEffect(() => {
    if (document.querySelector(".messages"))
      document.querySelector(".messages").scrollTop = "9999999999";
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const inputText = document.getElementById("input-message");
    if (inputText.value !== "") {
      const value = inputText.value;

      socket.emit(
        "send_message",
        cookies.get("id"),
        contactActive.idUser,
        value
      );
    }
    inputText.value = "";
  };

  const defineUser = (transmitter, receiver) => {
    if (transmitter === "date" || receiver === "date") {
      return "date";
    } else if (transmitter === cookies.get("id")) {
      return "user-two";
    } else if (receiver === cookies.get("id")) {
      return "user-one";
    }

    return;
  };

  const block = async (from, to) => {
    swal({
      title: "¿Estás seguro?",
      text: "Si bloqueas al usuario, no podrá enviarte mensajes o ver tus publicaciones, todas las notificaciones de este usuario, o cotizaciones quedarán eliminadas. Solo tú lo puedes desbloquear entrando de nuevo a su perfil y presionando el botón de desbloqueo.",
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        const result = await blockUser({ from, to });

        if (!result.error) {
          const products = await getProducts({
            blockSearch: cookies.get("id"),
          });
          setProducts(products);
          await searchNotifications();

          setIsBlocked({ blocked: true, userView: "from" });
          socket.emit("send_block", { from, to });

          swal({
            title: "Usuario Bloqueado",
            text: "El usuario ha sido bloqueado con éxito.",
            icon: "success",
            timer: "2000",
            button: false,
          });

          socket.emit("received event", to);
        } else {
          swal({
            title: "Error",
            text: "Hubo un error al bloquear el usuario.",
            icon: "error",
            timer: "2000",
            button: false,
          });
        }
      }
    });
  };

  const getHoursAndMinutes = (message) => {
    const date = new Date(message.creationDate);

    let hours = date.getHours();

    const AMPM = hours >= 12 ? "p. m." : "a. m.";

    let minutes = ("0" + date.getMinutes()).slice(-2);

    return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${AMPM}`;
  };

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
          {contacts.length === 0 ? (
            <div className="thereAreNoContact">
              <h1
                style={{
                  margin: "5px 0",
                  textAlign: "center",
                  color: "#FFFFFF",
                }}
              >
                No hay contactos
              </h1>
              <p style={{ color: "#CCCCCC", textAlign: "center" }}>
                Cuando alguien te escriba o inicies una conversación aparecerá
                aquí.
              </p>
            </div>
          ) : (
            <></>
          )}
          {contacts.length > 0 ? (
            <div
              className="recent-messages"
              style={{
                transform:
                  isActiveContact && width <= 700
                    ? "translateX(-1000px)"
                    : "translateX(0)",
              }}
            >
              {contacts.map((contact) => {
                const messages = contact.messages;

                return (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setIsActiveContact(true);
                    }}
                  >
                    <Contact
                      active={contact.active === null ? "" : "connected-user"}
                      idUser={contact.contraryIdentifier}
                      firstName={contact.fullName.firstName}
                      lastName={contact.fullName.lastName}
                      username={contact.fullName.username}
                      time={getHoursAndMinutes(messages[messages.length - 1])}
                      keyValue={contact.key}
                      lastMessage={{
                        message: messages[messages.length - 1].message,
                        receiver: messages[messages.length - 1].receiver,
                        noChecked: contact.noChecked,
                        view: messages[messages.length - 1].view,
                      }}
                      setContactActive={setContactActive}
                      setIsBlocked={setIsBlocked}
                      currentBlock={contact.currentBlock}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}

          {messages.length > 0 ? (
            <div className="message">
              <div className="message-header">
                <div className="message-header-main">
                  {width <= 700 && (
                    <i
                      className="fa-solid fa-bars"
                      onClick={() => setIsActiveContact(false)}
                    ></i>
                  )}
                  <Link
                    to={`/${
                      contactActive === null ||
                      contactActive.username === undefined
                        ? "messages"
                        : contactActive.username === "Admin"
                        ? "messages"
                        : contactActive.username
                    }`}
                    style={{ textDecoration: "none" }}
                  >
                    <h1 className="message-header-title">
                      {contactActive === null
                        ? "Cargando..."
                        : contactActive.firstName === undefined ||
                          contactActive.firstName === "" ||
                          contactActive.firstName === null
                        ? contactActive.username === undefined ||
                          contactActive.username === null
                          ? "ELIMINADO"
                          : contactActive.username
                        : `${contactActive.firstName} .${
                            contactActive.lastName === undefined
                              ? ""
                              : contactActive.lastName.slice(0, 1)
                          }`}
                    </h1>
                  </Link>
                </div>
                <div className="message-header-icon">
                  {!isBlocked.blocked &&
                  contactActive !== null &&
                  contactActive.username !== "Admin" &&
                  contactActive.username !== undefined ? (
                    <i
                      className="fas fa-ban"
                      title="Bloquear"
                      onClick={() =>
                        block(cookies.get("id"), contactActive.idUser)
                      }
                    ></i>
                  ) : (
                    ""
                  )}
                  {/*<i className="fas fa-trash-alt" title="Eliminar Chat"></i>*/}
                </div>
              </div>
              <div className="message-content">
                <div className="messages">
                  <div className="messages-by-date">
                    {messages.map((message, index) => {
                      return (
                        <div key={index}>
                          {defineUser(message.transmitter, message.receiver) ===
                            "date" && (
                            <div className="message-date-container">
                              <h1 className="message-date">
                                {message.message}
                              </h1>
                            </div>
                          )}
                          {defineUser(message.transmitter, message.receiver) !==
                            "date" && (
                            <div
                              key={message.id}
                              className={defineUser(
                                message.transmitter,
                                message.receiver
                              )}
                            >
                              <div className="message-container">
                                <p className="message-description">
                                  {message.message}
                                </p>
                                <p
                                  className="message-sent-date"
                                  style={{
                                    right:
                                      message.transmitter === cookies.get("id")
                                        ? "28px"
                                        : "5px",
                                  }}
                                >
                                  {getHoursAndMinutes(message)}
                                </p>
                                {message.transmitter === cookies.get("id") && (
                                  <div className="is-checked-message">
                                    <box-icon
                                      name="check-double"
                                      color={
                                        message.view ? "#3282B8" : "#BBBBBB"
                                      }
                                      size={18}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {!isBlocked.blocked ? (
                contactActive !== null &&
                contactActive.username !== "Admin" &&
                contactActive.username !== undefined && (
                  <form
                    className="send-message"
                    onSubmit={(e) => sendMessage(e)}
                  >
                    <input
                      type="text"
                      id="input-message"
                      placeholder="Escriba el mensaje"
                    />
                    <button id="send-message" onClick={(e) => sendMessage(e)}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                )
              ) : (
                <div className="message-blocked">
                  <i className="fas fa-ban"></i>
                  <p>
                    {isBlocked.userView === "from"
                      ? "Has bloqueado a este usuario"
                      : "Este usuario te ha bloqueado"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;
