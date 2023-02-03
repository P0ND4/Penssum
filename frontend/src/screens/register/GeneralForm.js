import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { getUser, createUser } from "../../api";
import { save } from "../../features/user/userSlice";
import { change as changeRegistration } from "../../features/function/registrationSlice";
import { change as changeRegister } from "../../features/function/registerSlice";
import jwt_decode from "jwt-decode";
import FacebookGoogle from "../../components/register/FacebookGoogle";
import Form from "./Form";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function GeneralForm() {
  const registration = useSelector((state) => state.registration);
  const { sendingInformation } = useSelector((state) => state.register);

  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState([]);
  const [contentError, setContentError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const responseFacebook = async (response) => {
    setContentError("");

    dispatch(changeRegister({ sendingInformation: true }));
    const exist = await getUser({ email: response.email });
    dispatch(changeRegister({ sendingInformation: false }));

    if (!exist.error) {
      setContentError(
        "El usuario ya está registrado, por favor inicie sesión."
      );
      setTimeout(() => setContentError(""), 3000);
      return;
    }

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
  };

  const responseGoogle = useCallback(
    async (response) => {
      setContentError("");
      const user = jwt_decode(response.credential);

      dispatch(changeRegister({ sendingInformation: true }));
      const exist = await getUser({ email: user.email });
      dispatch(changeRegister({ sendingInformation: false }));

      if (!exist.error) {
        setContentError(
          "El usuario ya está registrado, por favor inicie sesión."
        );
        setTimeout(() => setContentError(""), 3000);
        return;
      }

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
    },
    [dispatch]
  );

  const validation = async (data) => {
    setContentError("");
    setError([]);

    if (data.password === passwordRepeat) {
      dispatch(changeRegister({ sendingInformation: true }));
      const result = await createUser(data);
      if (result.error) {
        const controller = [];
        if (result.type.user) controller.push("user_exists");
        if (result.type.email) controller.push("email_exists");
        setError(controller);
        dispatch(changeRegister({ sendingInformation: false }));
      } else {
        dispatch(changeRegistration({ ...registration, selection: false }));
        cookies.set("id", result._id, { path: "/" });
        dispatch(save(result));
        navigate("/signup/selection");
      }
    } else setError(["repeatPassword"]);

    setTimeout(() => setError([]), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (!sendingInformation) validation(data);
      })}
      id="main-form-register"
    >
      <p
        className="field"
        style={{
          textAlign: "center",
          background: "#d10b0b",
          padding: "6px",
          borderRadius: "8px",
          color: "#FFFFFF",
          display: contentError.length > 0 ? "block" : "",
        }}
      >
        {contentError}
      </p>
      <Form
        register={register}
        errors={errors}
        error={error}
        sendingInformation={sendingInformation}
        passwordRepeat={passwordRepeat}
        setPasswordRepeat={setPasswordRepeat}
      />
      <FacebookGoogle
        title="O regístrate usando"
        responseFacebook={responseFacebook}
        responseGoogle={responseGoogle}
      />
    </form>
  );
}

export default GeneralForm;
