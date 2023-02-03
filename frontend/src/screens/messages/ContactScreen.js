import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change } from "../../features/user/messagesContentSlice";
import { getHoursAndMinutes } from "../../helpers";
import Contact from "../../components/Contact";

function ContactScreen() {
  const { contacts, isActiveContact } = useSelector((state) => state.messagesContent);
  const [width, setWidth] = useState(window.innerWidth);

  const dispatch = useDispatch();

  const changeWidth = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => window.removeEventListener("resize", changeWidth);
  });

  return (
    <>
      {contacts.length === 0 && (
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
            Cuando alguien te escriba o inicies una conversación aparecerá aquí.
          </p>
        </div>
      )}
      {contacts.length > 0 && (
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
                onClick={() => dispatch(change({ isActiveContact: true }))}
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
                  canYouType={contact.canYouType}
                  currentBlock={contact.currentBlock}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ContactScreen;
