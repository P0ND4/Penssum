import Cookies from "universal-cookie";

const cookies = new Cookies();

function Contact({
  active,
  username,
  firstName,
  lastName,
  time,
  lastMessage,
  idUser,
  setContactActive,
  setIsBlocked,
  keyValue,
  currentBlock
}) {
  async function changeWatching() {
    if (currentBlock.length > 0)
      setIsBlocked({
        blocked: true,
        userView: currentBlock[0].from === cookies.get("id") ? "from" : "to",
      });
    else setIsBlocked({ blocked: false, userView: null });

    const recents = document.querySelectorAll(".recent-message");
    recents.forEach((recent) => recent.classList.remove("message-watching"));

    document
      .querySelector(`.recent-message-${idUser}`)
      .classList.add("message-watching");

    setContactActive({ idUser, firstName, lastName, username, key: keyValue });
  }

  return (
    <div
      className={`recent-message recent-message-${idUser}`}
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
                  !lastMessage.view &&
                  lastMessage.receiver === cookies.get("id")
                    ? "#FFFFFF"
                    : "",
                fontWeight:
                  !lastMessage.view &&
                  lastMessage.receiver === cookies.get("id")
                    ? "600"
                    : "",
              }}
            >
              {lastMessage.message.slice(0, 20)}
              {lastMessage.message.length > 20 ? "..." : ""}
            </p>
          </div>
          <div className="information-contact-message">
            <p className="time-information-message" style={{ color: lastMessage.noChecked !== 0 ? '#3282B8' : '' }}>{time}</p>
            {lastMessage.noChecked !== 0 && <p className="no-checked-messages">{lastMessage.noChecked}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
