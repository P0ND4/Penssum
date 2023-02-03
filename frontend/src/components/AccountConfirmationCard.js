import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import { deleteUser } from "../api";

// Slice redux
import { logOut } from "../features/user/userSlice";

//

import Cookies from "universal-cookie";
import { inactive } from "../features/user/registrationControlSlice";

const cookies = new Cookies();

function AccountConfirmationCard() {
  const user = useSelector((state) => state.user);
  const registrationControl = useSelector((state) => state.registrationControl);

  const dispatch = useDispatch();

  const deleteConfirmation = () => {
    swal({
      title: "¿Estas seguro?",
      text: "Al cancelar la confirmacion, el usuario quedara eliminado.",
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        await deleteUser(user._id);
        cookies.remove("id");
        dispatch(inactive())
        dispatch(logOut());
      }
    });
  };

  return (
    registrationControl && (
      <div className="Account-Confirmation">
        <Link
          className="Account-Confirmation_link"
          to={
            user.objetive === "" ? "/signup/selection" : "/signup/check/email"
          }
        >
          {user.objetive === ""
            ? `Por favor complete el registro de ${user.username}`
            : `Confirma tu cuenta como ${user.username}`}
        </Link>
        <button onClick={() => deleteConfirmation()}>X</button>
      </div>
    )
  );
}

export default AccountConfirmationCard;
