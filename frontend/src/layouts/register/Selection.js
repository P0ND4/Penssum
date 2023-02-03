import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { accountAuthentication, socket } from "../../api";

// Slice redux
import { save } from "../../features/user/userSlice";
import { change as changeAuth } from "../../features/user/authSlice";

import { change as changeRegistration } from "../../features/function/registrationSlice";
import { inactive } from "../../features/user/registrationControlSlice";

//

import CardSelection from "../../components/CardSelection";
import Cookies from "universal-cookie";
import Loading from "../../components/Loading";

const cookies = new Cookies();

function Selection() {
  const user = useSelector((state) => state.user);
  const registration = useSelector((state) => state.registration);

  const [sendingInformation, setSendingInformation] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => dispatch(inactive()));

  const sendUserSelection = async (objetive) => {
    setSendingInformation(true);
    const result = await accountAuthentication({
      objetive: objetive,
      validated: user.registered === "local" ? false : true,
      email: user.email,
      id: user._id,
    });
    setSendingInformation(false);

    dispatch(changeRegistration({ validated: result.validated, selection: true }));

    dispatch(save(result));

    if (result.validated) {
      cookies.set("id", result._id, { path: "/" });
      dispatch(changeAuth(true));
      socket.emit("connected", result._id);
      navigate("/complete/information");
    } else {
      navigate("/signup/check/email");
    }
  };

  return (
    <div>
      {registration.selection === null ? (
        <div style={{ padding: "40px" }}>
          <Loading margin="auto" />
        </div>
      ) : !registration.selection ? (
        <div className="selection-container">
          <div className="selection">
            <h1 className="selection-title">SELECCIONE EL TIPO DE USUARIO</h1>
            <div className="card-selection-container">
              <CardSelection
                title="Estudiante"
                description="Busque a profesores que enseñen lo que necesite."
                src="/img/illustration/client.svg"
                alt="Alumno"
                sendUserSelection={sendUserSelection}
                sendingInformation={sendingInformation}
              />
              <CardSelection
                title="Profesor"
                description="Publique sus servicios como profesor."
                src="/img/illustration/supplier.svg"
                alt="Profesor"
                sendUserSelection={sendUserSelection}
                sendingInformation={sendingInformation}
              />
            </div>
          </div>
        </div>
      ) : (
        <Navigate to="/" />
      )}
    </div>
  );
}

export default Selection;
