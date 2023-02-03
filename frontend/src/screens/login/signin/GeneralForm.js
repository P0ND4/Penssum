import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { change as changeAuth } from "../../../features/user/authSlice";
import { save } from "../../../features/user/userSlice";
import { active } from "../../../features/dashboard/signInSlice";
import { change as changeRegister } from "../../../features/function/registerSlice";
import { loginUser, checkAdminInformation, socket } from "../../../api";
import jwt_decode from "jwt-decode";
import Form from "./Form";
import FacebookGoogle from "../../../components/register/FacebookGoogle";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function GeneralForm() {
  const { sendingInformation } = useSelector((state) => state.register);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [errorContent, setErrorContent] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const verification = async (data) => {
    setErrorContent("");
    dispatch(changeRegister({ sendingInformation: true }));
    const checkInformation = await checkAdminInformation({ security: 1, data });

    if (!checkInformation.error) {
      dispatch(active());
      return navigate("/signin/admin");
    }

    const result = await loginUser(data);

    if (result.error) {
      dispatch(changeRegister({ sendingInformation: false }));
      setErrorContent("Correo o contraseña inválida");
      return setTimeout(() => setErrorContent(''),3000);
    } else {
      dispatch(save(result));
      if (result.objetive === "") {
        navigate("/signup/selection");
      } else if (result.validated) {
        cookies.set("id", result._id, { path: "/" });
        dispatch(changeAuth(true));
        socket.emit("connected", result._id);
        navigate("/");
      } else {
        navigate("/signup/check/email");
      }
    }
  };

  const responseGoogle = useCallback(
    async (response) => {
      const user = jwt_decode(response.credential);

      const data = {
        email: user.email,
        password: user.sub,
        isSocialNetwork: true,
      };

      dispatch(changeRegister({ sendingInformation: true }));
      const result = await loginUser(data);
      dispatch(changeRegister({ sendingInformation: false }));

      if (result.error) {
        dispatch(
          changeRegister({
            socialNetworkData: {
              firstName: user.given_name,
              lastName: user.family_name,
              email: user.email,
              profilePicture: user.picture,
              registered: "google",
            },
          })
        );

        dispatch(changeRegister({ activeFloatingUsername: true }));
      } else {
        if (result.objetive === "") navigate("/signup/selection");
        else {
          cookies.set("id", result._id, { path: "/" });
          dispatch(save(result));
          dispatch(changeAuth(true));
          socket.emit("connected", result._id);
          navigate("/");
        }
      }
    },
    [navigate, dispatch]
  );

  const responseFacebook = async (response) => {
    const data = {
      email: response.email,
      password: response.userID,
      isSocialNetwork: true,
    };

    dispatch(changeRegister({ sendingInformation: true }));
    const result = await loginUser(data);
    dispatch(changeRegister({ sendingInformation: false }));

    if (result.error) {
      dispatch(
        changeRegister({
          socialNetworkData: {
            email: response.email,
            profilePicture: response.picture.data.url,
            registered: "facebook",
          },
        })
      );

      dispatch(changeRegister({ activeFloatingUsername: true }));
    } else {
      if (result.objetive === "") navigate("/signup/selection");
      else {
        cookies.set("id", result._id, { path: "/" });
        dispatch(save(result));
        dispatch(changeAuth(true));
        socket.emit("connected", result._id);
        navigate("/");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (!sendingInformation) verification(data);
      })}
    >
      <p
        className="field login_error"
        style={{
          textAlign: "center",
          background: "#d10b0b",
          padding: "6px",
          borderRadius: "8px",
          color: "#FFFFFF",
          display:
            errors.email?.type === "required" ||
            errors.password?.type === "required" ||
            errorContent.length > 0
              ? "block"
              : "none",
        }}
      >
        {errors.email?.type === "required" ||
        errors.password?.type === "required"
          ? "Rellene los campos"
          : errorContent}
      </p>
      <Form register={register} errors={errors} />
      <div className="form-control you-forgot-the-password">
        <Link to="/signin/recovery/email" id="you-forgot-the-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <FacebookGoogle
        title="O inicia sesión usando"
        responseFacebook={responseFacebook}
        responseGoogle={responseGoogle}
      />
    </form>
  );
}

export default GeneralForm;
