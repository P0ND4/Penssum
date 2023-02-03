import { useSelector, useDispatch } from "react-redux";
import { change } from "../features/user/messagesContentSlice";

function Contact({
  active,
  username,
  firstName,
  lastName,
  time,
  lastMessage,
  idUser,
  keyValue,
  currentBlock,
  canYouType,
}) {
  const user = useSelector((state) => state.user);
  const { watching } = useSelector((state) => state.messagesContent);
  const dispatch = useDispatch();

  async function changeWatching() {
    if (currentBlock.length > 0)
      dispatch(
        change({
          isBlocked: {
            blocked: true,
            userView: currentBlock[0].from === user._id ? "from" : "to",
          },
        })
      );
    else dispatch(change({ isBlocked: { blocked: false, userView: null } }));

    dispatch(change({ canYouType }));
    dispatch(change({ watching: idUser }));

    dispatch(
      change({
        contactActive: { idUser, firstName, lastName, username, key: keyValue },
      })
    );
  }

  return (
    <div
      className="recent-message"
      style={{ background: idUser === watching ? "#38454d" : "" }}
      onClick={() => changeWatching()}
    >
      <div className={`user-connection ${active}`}></div>
      <div className="brief-information">
        <div className="message-name-and-description">
          <div>
            <h2>
              {firstName === undefined || firstName === "" || firstName === null
                ? username === undefined || username === null
                  ? "ELIMINADO"
                  : username.slice(0, 14) + "..."
                : `${firstName.slice(0, 10)} .${
                    lastName === undefined ? "" : lastName.slice(0, 1)
                  }`}
            </h2>
            <p
              className="short-paragrahp"
              style={{
                color:
                  !lastMessage.view && lastMessage.receiver === user._id
                    ? "#FFFFFF"
                    : "",
                fontWeight:
                  !lastMessage.view && lastMessage.receiver === user._id
                    ? "600"
                    : "",
              }}
            >
              {lastMessage.message.slice(0, 20)}
              {lastMessage.message.length > 20 ? "..." : ""}
            </p>
          </div>
          <div className="information-contact-message">
            <p
              className="time-information-message"
              style={{ color: lastMessage.noChecked !== 0 ? "#3282B8" : "" }}
            >
              {time}
            </p>
            {lastMessage.noChecked !== 0 && (
              <p className="no-checked-messages">{lastMessage.noChecked}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
