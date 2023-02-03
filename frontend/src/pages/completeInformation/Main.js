import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { sendCompleteInformation } from "../../api";
import { save } from "../../features/user/userSlice";
import { change } from "../../features/user/zoneSlice";
import { thousandsSystem } from "../../helpers";
import swal from "sweetalert";

function Main() {
  const user = useSelector((state) => state.user);
  const [sendingInformation, setSendingInformation] = useState(false);
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm();

  const [valuePerHourString, setValuePerHourString] = useState("");
  const [letters, setLetters] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const initialValue = () => {
      setValue("firstName", user.firstName);
      setValue("secondName", user.secondName);
      setValue("lastName", user.lastName);
      setValue("secondSurname", user.secondSurname);
      setValue("phoneNumber", user.phoneNumber);
      setValue("identification", user.identification);
      setValue("description", user.description);
      setValue("valuePerHour", user.valuePerHour ? user.valuePerHour : 0);
    };
    initialValue();
  }, [user, setValue]);

  useEffect(() => {
    if (user) {
      setValuePerHourString(
        user.valuePerHour ? thousandsSystem(user.valuePerHour) : ""
      );
    }
  }, [user]);

  const sendInformation = async (data) => {
    let information;

    if (user.objetive === "Profesor") information = data;
    else {
      information = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
    }

    setSendingInformation(true);
    const result = await sendCompleteInformation({
      id: user._id,
      data: information,
    });
    dispatch(save(result));
    setSendingInformation(false);

    if (user.objetive === "Profesor") {
      dispatch(change("subjects"));
      navigate("/complete/information/subjects");
    } else {
      swal({
        title: "!ÉXITO!",
        text: "Tu información ha sido verificada, puedes utilizar PENSSUM con libertad.",
        icon: "success",
        timer: "3000",
        button: false,
      }).then(() => navigate(`/${user.username}`));
    }
  };

  return (
    <div className="complete-form">
      <form
        onSubmit={handleSubmit((data) => {
          if (!sendingInformation) sendInformation(data);
        })}
      >
        <div className="complete-form-title">
          <h1>FORMULARIO</h1>
          <p>
            Debes completar este formulario para usar su cuenta con libertad.
          </p>
        </div>
        <div className="form-control">
          <input
            type="text"
            placeholder="Primer nombre"
            {...register("firstName", {
              required: true,
              pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s]{3,30}$/,
            })}
          />
          {errors.firstName?.type && (
            <p className="field" style={{ display: "block" }}>
              El nombre debe contener sólo letras, no puede superar los 16
              caracteres ni tener menos de 3 caracteres.
            </p>
          )}
        </div>
        {user.objetive === "Profesor" && (
          <div className="form-control">
            <input
              type="text"
              placeholder="Segundo nombre"
              {...register("secondName", {
                required: true,
                pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s]{3,30}$/,
              })}
            />
            {errors.secondName?.type && (
              <p className="field" style={{ display: "block" }}>
                El segundo debe contener sólo letras, no puede superar los 16
                caracteres ni tener menos de 3 caracteres.
              </p>
            )}
          </div>
        )}
        <div className="form-control">
          <input
            type="text"
            placeholder="Primer apellido"
            {...register("lastName", {
              required: true,
              pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s]{3,30}$/,
            })}
          />
          {errors.lastName?.type && (
            <p className="field" style={{ display: "block" }}>
              El apellido debe contener sólo letras, no puede superar los 16
              caracteres ni tener menos de 3 caracteres.
            </p>
          )}
        </div>
        {user.objetive === "Profesor" && (
          <div className="form-control">
            <input
              type="text"
              placeholder="Segundo apellido"
              {...register("secondSurname", {
                required: true,
                pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s]{3,30}$/,
              })}
            />
            {errors.secondSurname?.type && (
              <p className="field" style={{ display: "block" }}>
                El segundo debe contener sólo letras, no puede superar los 16
                caracteres ni tener menos de 3 caracteres.
              </p>
            )}
          </div>
        )}
        <div className="form-control">
          <input
            type="number"
            placeholder="Número de teléfono"
            {...register("phoneNumber", {
              required: true,
              pattern: /^[0-9]{5,20}$/,
            })}
          />
          {errors.phoneNumber?.type && (
            <p className="field" style={{ display: "block" }}>
              El número de teléfono no puede superar los 20 dígitos.
            </p>
          )}
        </div>
        {user.objetive === "Profesor" && (
          <div className="form-control">
            <input
              type="text"
              placeholder="Cédula de identidad"
              {...register("identification", {
                required: true,
                pattern: /^[0-9]{5,20}$/,
              })}
            />
            {errors.identification?.type && (
              <p className="field" style={{ display: "block" }}>
                Identificación invalida.
              </p>
            )}
          </div>
        )}
        {user.objetive === "Profesor" && (
          <div className="form-control">
            <input
              type="text"
              placeholder="Valor por hora (COP)"
              {...register("valuePerHour", {
                required: true,
                pattern: /^[0-9.]{2,20}$/,
                setValueAs: (num) => {
                  const string = num.toString();
                  const value = parseInt(string.replace(/\./g, ""));
                  return isNaN(value) ? 0 : value;
                },
                validate: (value) => value > 0,
                onChange: (e) => {
                  var num = e.target.value.replace(/\./g, "");
                  if (!isNaN(num)) {
                    num = num
                      .toString()
                      .split("")
                      .reverse()
                      .join("")
                      .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                    num = num.split("").reverse().join("").replace(/^[.]/, "");
                    setValuePerHourString(num);
                  } else
                    setValuePerHourString(
                      e.target.value.replace(/[^\d.]*/g, "")
                    );
                },
              })}
              value={valuePerHourString}
            />
            {errors.valuePerHour?.type && (
              <p className="field" style={{ display: "block" }}>
                El valor por hora no puede ser menor que 2 dígitos ni superar
                los 20.
              </p>
            )}
          </div>
        )}
        {user.objetive === "Profesor" && (
          <div>
            <div className="complete-form-description-zone">
              <textarea
                className="complete-form-textarea"
                maxLength={250}
                placeholder="Has una breve descripción de quien eres."
                id="preference-description-input"
                {...register("description", {
                  required: true,
                  pattern: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{30,120}$/,
                  onChange: (e) => setLetters(e.target.value.length),
                })}
              />
              <span id="letter-count-description-textarea">{letters}/250</span>
            </div>
            {errors.description?.type && (
              <p className="field" style={{ display: "block" }}>
                La descripción no puede superar los 250 caracteres ni tener
                menos de 30 caracteres.
              </p>
            )}
          </div>
        )}
        <div className="complete-form-button-container">
          <Link id="cancel-complete-form" to={`/${user.username}`}>
            Cancelar
          </Link>
          <button
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            id="save-complete-form"
          >
            {user.objetive === "Alumno" ? "Guardar" : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Main;
