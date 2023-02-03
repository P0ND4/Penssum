import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUsers, getAllUsers, socket } from "../../api";
import swal from "sweetalert";
import FoundUser from "../../components/dashboard/FoundUser";
import { changeDate } from "../../helpers";
import { change, clean } from "../../features/dashboard/usersSlice";


function Users() {
  const [sendingInformation, setSendingInformation] = useState(false);
  const users = useSelector(state => state.users);

  const dispatch = useDispatch();

  const searchAllUsers = async () => {
    const value = document.getElementById("search-user-dashboard").value;

    if (value !== "") {
      setSendingInformation(true);
      const result = await getAllUsers(value);

      if (result.error) dispatch(clean())
      else dispatch(change(result));

      setTimeout(() => setSendingInformation(false), 800);
    }
  };

  const sendMessageToEachUser = () => {
    swal({
      title: "ESCRIBE EL MENSAJE",
      content: {
        element: "input",
        attributes: {
          placeholder: "Mensaje para todos los usuarios",
          type: "text",
        },
      },
      button: "Enviar",
    }).then((value) => {
      if (value === null) return;

      if (value) {
        socket.emit("send_message_to_each_user", value);
        socket.emit("received event");

        swal({
          title: "Enviado",
          text: "Mensaje enviado con exito.",
          icon: "success",
          timer: "2000",
          button: false,
        });
      }
    });
  };

  return (
    <div className="commomStylePadding">
      <div className="header-users-dashboard">
        <div className="search-user-dashboard-container">
          <input
            type="text"
            id="search-user-dashboard"
            placeholder="Buscar usuarios"
            onChange={async (e) => {
              if (e.target.value === "") {
                const users = await getUsers();
                dispatch(change(users));
              }
            }}
          />
          <i
            className="fas fa-search"
            id="dashboard-user-search"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) searchAllUsers();
            }}
          ></i>
        </div>
        <div className="dashboard-user-section-option">
          <i
            className="fas fa-envelope-open-text"
            title="Enviar mensajes a todos los usuarios"
            onClick={() => sendMessageToEachUser()}
          ></i>
        </div>
      </div>
      <div className="found-users-container">
        {users !== null && users.length > 0 ? (
          users.map((user) => {
            return (
              <div
                key={user._id + user.username + changeDate(user.creationDate)}
              >
                <FoundUser
                  id={user._id}
                  username={user.username}
                  date={changeDate(user.creationDate)}
                  userInformation={user}
                  data={{
                    property: `${user._id}-information-dashboard`,
                    registered: user.registered,
                    objetive: user.objetive,
                    email: user.email,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    lastName: user.lastName,
                    secondSurname: user.secondSurname,
                    description: user.description,
                    profilePicture: user.profilePicture,
                    coverPhoto: user.coverPhoto,
                    identification: user.identification,
                    yearsOfExperience: user.yearsOfExperience,
                    phoneNumber: user.phoneNumber,
                    availability: user.availability,
                    virtualClasses: user.virtualClasses,
                    faceToFaceClasses: user.faceToFaceClasses,
                    subjects: user.specialty.subjects,
                    topics: user.specialty.topics,
                    showMyNumber: user.showMyNumber,
                    typeOfUser: user.typeOfUser,
                    validated: user.validated,
                  }}
                />
              </div>
            );
          })
        ) : (
          <h1 className="thereAreNoUsersInDashboard">
            NO HAY USUARIOS EN LA APLICACIÓN
          </h1>
        )}
      </div>
    </div>
  );
}

export default Users;
