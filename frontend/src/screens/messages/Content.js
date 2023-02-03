import { useSelector } from "react-redux";
import { getHoursAndMinutes } from "../../helpers";

function Content() {
  const user = useSelector((state) => state.user);
  const { messages } = useSelector((state) => state.messagesContent);

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

  return (
    <div className="message-content">
      <div className="messages">
        <div className="messages-by-date">
          {messages.map((message, index) => {
            return (
              <div key={index}>
                {defineUser(message.transmitter, message.receiver) ===
                  "date" && (
                  <div className="message-date-container">
                    <h1 className="message-date">{message.message}</h1>
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
                      <p className="message-description">{message.message}</p>
                      <p
                        className="message-sent-date"
                        style={{
                          right:
                            message.transmitter === user._id ? "28px" : "5px",
                        }}
                      >
                        {getHoursAndMinutes(message)}
                      </p>
                      {message.transmitter === user._id && (
                        <div className="is-checked-message">
                          <box-icon
                            name="check-double"
                            color={message.view ? "#3282B8" : "#BBBBBB"}
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
  );
}

export default Content;
