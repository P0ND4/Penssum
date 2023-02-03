import GeneralForm from "../../screens/login/signin/GeneralForm";
import FloatingWindows from "../../components/register/FloatingWindows";

function Signin() {
  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-card-title">
          <h1>Iniciar sesión</h1>
        </div>
        <GeneralForm />
      </div>
      <div className="illustration-signin-container">
        <img src="./img/illustration/login.svg" alt="illustration-svg-signin" />
      </div>
      <FloatingWindows />
    </div>
  );
}

export default Signin;
