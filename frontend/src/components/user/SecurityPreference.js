import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// Slice redux
import { save } from "../../features/user/userSlice";

//

import { changePassword } from "../../api";
import Cookies from "universal-cookie";
import swal from "sweetalert";

const cookies = new Cookies();

function SecurityPreference(data) {
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    document.getElementById("passwordCurrent-input-edit").value =
      password.currentPassword;
    document.getElementById("password-input-edit").value = password.newPassword;
    document.getElementById("passwordRepeat-input-edit").value =
      password.repeatPassword;
  }, [password]);

  const validationPassword = async () => {
    const passwordTest = /^.{6,30}$/;

    if (!passwordTest.test(password.newPassword)) {
      document
        .querySelector(".field_error-invalid-change-password")
        .classList.add("showError");
      setTimeout(
        () =>
          document
            .querySelector(".field_error-invalid-change-password")
            .classList.remove("showError"),
        2000
      );
      return;
    }

    if (password.newPassword === password.repeatPassword) {
      const information = {
        id: cookies.get("id"),
        password: password.currentPassword,
        newPassword: password.newPassword,
      };

      const result = await changePassword(information);

      if (result.error) {
        document
          .querySelector(".field_current-password")
          .classList.add("showError");
        setTimeout(
          () =>
            document
              .querySelector(".field_current-password")
              .classList.remove("showError"),
          2000
        );
        return;
      } else {
        document.getElementById("password-dark").style.display = "none";

        dispatch(save(result));
        swal({
          title: "Contraseña cambiada",
          text: "La contraseña ha sido cambiada satisfactoriamente",
          icon: "success",
          timer: "2000",
          button: false,
        });
        setPassword({
          currentPassword: "",
          newPassword: "",
          repeatPassword: "",
        });
        return;
      }
    }

    document.querySelector(".field_error-password").classList.add("showError");
    setTimeout(
      () =>
        document
          .querySelector(".field_error-password")
          .classList.remove("showError"),
      2000
    );
    return;
  };

  return (
    <div>
      <div className="security-preference-card">
        <div className="security-preference">
          <i className={data.i}></i>
          <div className="security-preference-union">
            <h4>{data.property}</h4>
            {data.span ? (
              <p>
                <span>{data.span}</span>. {data.description}
              </p>
            ) : (
              <p>{data.description}</p>
            )}
          </div>
        </div>
        <button
          id={data.id}
          onClick={() => {
            if (data.securityType === "password") {
              document.getElementById("password-dark").style.display = "flex";
            }
          }}
        >
          Editar
        </button>
      </div>

      {data.securityType === "password" ? (
        <div className="dark" id="password-dark">
          <div className="dark-input">
            <h1>Cambiar contraseña</h1>
            <p
              className="field field_current-password"
              style={{
                textAlign: "center",
                background: "#d10b0b",
                padding: "6px",
                borderRadius: "8px",
                color: "#FFFFFF",
                margin: "5px 0",
              }}
            >
              La contraseña actual es incorrecta.
            </p>
            <p
              className="field field_error-password"
              style={{
                textAlign: "center",
                background: "#d10b0b",
                padding: "6px",
                borderRadius: "8px",
                color: "#FFFFFF",
                margin: "5px 0",
              }}
            >
              Las contraseñas no son iguales.
            </p>
            <p
              className="field field_error-invalid-change-password"
              style={{
                textAlign: "center",
                background: "#d10b0b",
                padding: "6px",
                borderRadius: "8px",
                color: "#FFFFFF",
                margin: "5px 0",
              }}
            >
              La contraseña no debe tener menos de 6 caracteres ni superar los
              30 caracteres.
            </p>
            <input
              type="password"
              placeholder="Introduzca la contraseña actual"
              id="passwordCurrent-input-edit"
              style={{ margin: "5px" }}
              name="currentPassword"
              onChange={(e) =>
                setPassword({ ...password, currentPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Introduzca la nueva contraseña"
              id="password-input-edit"
              style={{ margin: "5px" }}
              name="newPassword"
              onChange={(e) =>
                setPassword({ ...password, newPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Repita la nueva contraseña"
              id="passwordRepeat-input-edit"
              style={{ margin: "5px" }}
              name="repeatPassword"
              onChange={(e) =>
                setPassword({ ...password, repeatPassword: e.target.value })
              }
            />
            <div className="dark-button-container">
              <button
                className="save-edit"
                id="edit-ci"
                onClick={() => validationPassword()}
              >
                Guardar
              </button>
              <button
                className="cancel-edit"
                onClick={() => {
                  document.getElementById("password-dark").style.display =
                    "none";
                  document.getElementById("password-input-edit").value = "";
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default SecurityPreference;
