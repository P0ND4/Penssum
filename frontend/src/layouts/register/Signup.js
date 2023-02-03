import Description from "../../screens/register/Description";
import GeneralForm from "../../screens/register/GeneralForm";
import FloatingWindows from "../../components/register/FloatingWindows";

function Signup() {
  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-card-title">
          <h1>Registrarte</h1>
        </div>
        <GeneralForm />
      </div>
      <Description />
      <FloatingWindows />
    </div>
  );
}

export default Signup;