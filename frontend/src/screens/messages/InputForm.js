import { useSelector } from "react-redux";
import { socket } from "../../api";

function InputForm() {
  const user = useSelector(state => state.user);
  const { isBlocked, contactActive, canYouType } = useSelector(
    (state) => state.messagesContent
  );

  const sendMessage = (e) => {
    e.preventDefault();
    const inputText = document.getElementById("input-message");
    if (inputText.value !== "") {
      const value = inputText.value;

      socket.emit(
        "send_message",
        user._id,
        contactActive.idUser,
        value
      );
    }
    inputText.value = "";
  };

  return !isBlocked.blocked ? (
    contactActive !== null &&
    contactActive.username !== undefined &&
    canYouType ? (
      <form className="send-message" onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          id="input-message"
          placeholder="Escriba el mensaje"
        />
        <button id="send-message" onClick={(e) => sendMessage(e)}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    ) : (
      contactActive.username !== "Admin" && (
        <p className="cannot-write">
          {user.objetive === "Profesor"
            ? "Necesita tomar una publicación perteneciente a este alumno para poder escribir"
            : "El profesor no ha tomado ninguna de tus publicaciones"}
        </p>
      )
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
  );
}

export default InputForm;
