import { useSelector } from "react-redux";

function Form({ register }) {
  const { sendingInformation } = useSelector(state => state.register);

  return (
    <>
      <div className="form-container">
        <div className="form-control">
          <input
            type="text"
            placeholder="Correo o nombre de usuario"
            {...register('email',{ required: true })}
          />
        </div>
        <div className="form-control">
          <input
            type="password"
            placeholder="Contraseña"
            {...register('password',{ required: true })}
          />
        </div>
      </div>
      <div className="form-control">
        <button
          id="signin-button"
          style={{
            background: sendingInformation ? "#3282B8" : "",
            opacity: sendingInformation ? ".4" : "",
            cursor: sendingInformation ? "not-allowed" : "",
          }}
        >
          Ingresar
        </button>
      </div>
    </>
  );
}

export default Form;
