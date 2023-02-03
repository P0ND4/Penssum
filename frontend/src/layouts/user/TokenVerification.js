import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { tokenVerification, socket } from "../../api";
import Loading from "../../components/Loading";

// Slice redux
import { save } from "../../features/user/userSlice";
import { change } from "../../features/user/authSlice";
import { inactive } from "../../features/user/registrationControlSlice";

//

import Cookies from "universal-cookie";

const cookies = new Cookies();

function TokenVerification() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => dispatch(inactive()));

  useEffect(() => {
    const loadToken = async () => {
      const result = await tokenVerification(token);

      if (result.error) {
        navigate("/");
      } else {
        cookies.set("id", result._id, { path: "/" });
        dispatch(save(result));
        dispatch(change(true));
        socket.emit("connected", result._id);
        navigate("/complete/information");
      }
    };
    loadToken();
  }, [navigate, dispatch, token]);

  return (
    <div className="Token-Verification-Container">
      <Loading size={120} />
      <h1>PROCESANDO SOLICITUD</h1>
      <p>Este proceso puede durar unos minutos por favor espere.</p>
    </div>
  );
}

export default TokenVerification;
