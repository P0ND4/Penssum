import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUser, getUser } from "../../api";
import { change as changeRegister } from "../../features/function/registerSlice";
import { change as changeRegistration } from "../../features/function/registrationSlice";
import { save } from "../../features/user/userSlice";
import FloatingData from "../FloatingData";
import Cookies from "universal-cookie";
import swal from "sweetalert";

const cookies = new Cookies();

function FloatingWindows() {
  const registration = useSelector((state) => state.registration);
  const { activeFloatingUsername, activeFloatingPassword, socialNetworkData } =
    useSelector((state) => state.register);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveUsername = async (username) => {
    dispatch(
      changeRegister({
        socialNetworkData: {
          ...socialNetworkData,
          username,
        },
      })
    );

    dispatch(changeRegister({ sendingInformation: true }));
    const exist = await getUser({ username });
    dispatch(changeRegister({ sendingInformation: false }));

    if (exist.error) dispatch(changeRegister({ activeFloatingPassword: true }));
    else {
      swal({
        title: "!OOPS!",
        text: "El nombre de usuario está tomado, escoge otro, por favor",
        icon: "error",
        button: "!Ok!",
      }).then(() => dispatch(changeRegister({ activeFloatingUsername: true })));
    }
  };

  const create = async (password) => {
    const data = {
      ...socialNetworkData,
      password,
    };

    console.log(data);

    dispatch(changeRegister({ sendingInformation: true }));
    const result = await createUser(data);
    dispatch(changeRegister({ sendingInformation: false }));

    dispatch(changeRegistration({ ...registration, selection: false }));
    cookies.set("id", result._id, { path: "/" });
    dispatch(save(result));
    navigate("/signup/selection");
  };

  return (
    <>
      {activeFloatingUsername && (
        <FloatingData
          title="Elija su nombre de usuario"
          description="Este será su identificador en nuestra plataforma penssum"
          cancel="true"
          cancelEvent={() =>
            dispatch(changeRegister({ socialNetworkData: {} }))
          }
          placeholder="Nombre de usuario"
          spaces={false}
          maxLength={20}
          minLength={3}
          regularExpressions={/^[a-zA-Z0-9_.-]{0,20}$/}
          setActive={() =>
            dispatch(
              changeRegister({
                activeFloatingUsername: false,
              })
            )
          }
          sendCallback={saveUsername}
        />
      )}
      {activeFloatingPassword && (
        <FloatingData
          title="Contraseña"
          description="Ahora cree una buena contraseña para su cuenta, debe tener mínimo 6 caracteres y un máximo de 30"
          cancel="true"
          cancelEvent={() =>
            dispatch(changeRegister({ socialNetworkData: {} }))
          }
          placeholder="Contraseña"
          password
          maxLength={30}
          minLength={6}
          setActive={() =>
            dispatch(changeRegister({ activeFloatingPassword: false }))
          }
          sendCallback={create}
        />
      )}
    </>
  );
}

export default FloatingWindows;
