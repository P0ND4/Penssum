import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { vote, rejectionVote } from "../api";
import Cookies from "universal-cookie";
import swal from "sweetalert";
import { change } from "../features/function/voteSlice";
import { inactive } from "../features/function/handlerVoteSlice";

const cookies = new Cookies();

function Vote({
  pending,
  required,
  setHandlerVote,
  setVote,
  postInformation,
  setActiveVote,
  userToVote,
}) {
  const votePending = useSelector((state) => state.vote);
  const dispatch = useDispatch();

  const [score, setScore] = useState(0);

  const voteUser = (currentVote) => {
    setScore(currentVote);
    if (setVote) setVote(currentVote);
    if (currentVote === score) {
      setScore(currentVote);
      if (setVote) setVote(currentVote);
    }
  };

  const eventVote = (remove) => {
    const currentUsers = [];

    votePending.forEach(async (user, index) => {
      if (user._id !== votePending[0]._id) currentUsers.push(user);

      if (index + 1 === votePending.length) {
        dispatch(inactive());
        dispatch(change(currentUsers));

        await rejectionVote({
          from: cookies.get("id"),
          to: votePending[0]._id,
          remove,
        });
      }
    });
  };

  const event = (remove) => {
    if (remove) {
      swal({
        title: "¿No quieres calificar al usuario?",
        text: "¿Estás seguro de que quieres eliminar la calificación para este usuario?",
        icon: "warning",
        buttons: ["No", "Si"],
      }).then((res) => {
        if (res) eventVote(remove);
      });
    } else eventVote(remove);
  };

  const sendVote = () => {
    const currentUsers = [];

    votePending.forEach(async (user, index) => {
      if (user._id !== votePending[0]._id) currentUsers.push(user);

      if (index + 1 === votePending.length) {
        dispatch(inactive());
        dispatch(change(currentUsers));
        await vote({
          from: cookies.get("id"),
          to: votePending[0]._id,
          vote: score,
          pending: pending,
        });
      }
    });
  };

  return (
    <div className="vote-container">
      <div className="vote">
        <img
          src={
            !postInformation
              ? votePending[0].profilePicture === null ||
                votePending[0].profilePicture === undefined
                ? "/img/noProfilePicture.png"
                : votePending[0].profilePicture
              : userToVote.profilePicture === null ||
                userToVote.profilePicture === undefined
              ? "/img/noProfilePicture.png"
              : userToVote.profilePicture
          }
          alt="user to vote"
        />
        <h1>
          Puntuar a{" "}
          {!postInformation
            ? votePending[0].firstName
              ? votePending[0].firstName
              : votePending[0].secondName
              ? votePending[0].secondName
              : votePending[0].username
            : userToVote.firstName
            ? userToVote.firstName
            : userToVote.secondName
            ? userToVote.secondName
            : userToVote.username}
        </h1>
        <h2>
          {score !== 0
            ? score === 1
              ? "HORRIBLE"
              : score === 2
              ? "MALO"
              : score === 3
              ? "NORMAL"
              : score === 4
              ? "BUENO"
              : "EXCELENTE"
            : ""}
        </h2>
        <div className="vote-start-container">
          <i
            className="fas fa-star"
            style={{
              color: score === 5 ? "#fe7" : "",
              textShadow: score === 5 ? "0 0 20px #952" : "",
            }}
            onClick={() => voteUser(5)}
          ></i>
          <i
            className="fas fa-star"
            style={{
              color:
                score === 4 || score === 5
                  ? score !== 5
                    ? "#fbff00"
                    : "#fe7"
                  : "",
              textShadow: score === 5 ? "0 0 20px #952" : "",
            }}
            onClick={() => voteUser(4)}
          ></i>
          <i
            className="fas fa-star"
            style={{
              color:
                score === 3 || score === 5 || score === 4
                  ? score !== 5
                    ? "#fbff00"
                    : "#fe7"
                  : "",
              textShadow: score === 5 ? "0 0 20px #952" : "",
            }}
            onClick={() => voteUser(3)}
          ></i>
          <i
            className="fas fa-star"
            style={{
              color:
                score === 2 || score === 5 || score === 4 || score === 3
                  ? score !== 5
                    ? "#fbff00"
                    : "#fe7"
                  : "",
              textShadow: score === 5 ? "0 0 20px #952" : "",
            }}
            onClick={() => voteUser(2)}
          ></i>
          <i
            className="fas fa-star"
            style={{
              color:
                score === 1 ||
                score === 5 ||
                score === 4 ||
                score === 3 ||
                score === 2
                  ? score !== 5
                    ? "#fbff00"
                    : "#fe7"
                  : "",
              textShadow: score === 5 ? "0 0 20px #952" : "",
            }}
            onClick={() => voteUser(1)}
          ></i>
        </div>
        {score !== 0 && (
          <button
            onClick={() => {
              if (!postInformation) {
                sendVote();
              } else {
                setHandlerVote(true);
                setActiveVote(false);
              }
            }}
          >
            Listo
          </button>
        )}
        {required && (
          <button onClick={() => setActiveVote(false)}>Cancelar</button>
        )}
        {!required && <p onClick={() => event(false)}>Quizas mas tarde</p>}
        {!required && (
          <p onClick={() => event(true)}>No votar a este usuario</p>
        )}
      </div>
    </div>
  );
}

export default Vote;
