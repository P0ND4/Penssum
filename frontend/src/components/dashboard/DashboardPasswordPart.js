import { useState, useEffect } from "react";
import { changeDashboardPassword } from "../../api";
import swal from "sweetalert";

function DashboardPasswordPart(data) {
  const [reset, setReset] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  useEffect(() => {
    document.getElementById(`passwordCurrent-2-input-edit`).value = "";
    document.getElementById(`password-2-input-edit`).value = "";
    document.getElementById(`passwordRepeat-2-input-edit`).value = "";
    document.getElementById(`passwordCurrent-1-input-edit`).value = "";
    document.getElementById(`password-1-input-edit`).value = "";
    document.getElementById(`passwordRepeat-1-input-edit`).value = "";

    return () => setReset(false);
  }, [reset]);

  const validationPassword = async (typePassword, property) => {
    const passwordTest = /^.{4,30}$/;

    if (!passwordTest.test(password.newPassword)) {
      document
        .querySelector(
          `.field_${data.typePassword}-error-invalid-change-password`
        )
        .classList.add("showError");
      setTimeout(
        () =>
          document
            .querySelector(
              `.field_${data.typePassword}-error-invalid-change-password`
            )
            .classList.remove("showError"),
        2000
      );
      return;
    }

    if (password.newPassword === password.repeatPassword) {
      const information = {
        typePassword,
        password: password.currentPassword,
        newPassword: password.newPassword,
      };

      const result = await changeDashboardPassword(information);

      if (result.error) {
        document
          .querySelector(`.field_${typePassword}-current-password`)
          .classList.add("showError");
        setTimeout(
          () =>
            document
              .querySelector(`.field_${typePassword}-current-password`)
              .classList.remove("showError"),
          2000
        );
        return;
      } else {
        document.getElementById(property).style.display = "none";
        document.querySelector("body").style.overflow = "auto";
        setReset(true);

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

    document
      .querySelector(`.field_${data.typePassword}-error-password`)
      .classList.add("showError");
    setTimeout(
      () =>
        document
          .querySelector(`.field_${data.typePassword}-error-password`)
          .classList.remove("showError"),
      2000
    );
    return;
  };

  return (
    <div>
      <div
        className="security-preference-card"
        style={{
          padding: "15px 30px",
          background: "#FFFFFF",
          borderRadius: "40px",
        }}
      >
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
            document.getElementById(data.property).style.display = "flex";
            document.querySelector("body").style.overflow = "hidden";
          }}
        >
          Editar
        </button>
      </div>

      <div className="dark" id={data.property}>
        <div className="dark-input">
          <h1>Cambiar contraseña</h1>
          <p
            className={`field field_${data.typePassword}-current-password`}
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
            className={`field field_${data.typePassword}-error-password`}
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
            className={`field field_${data.typePassword}-error-invalid-change-password`}
            style={{
              textAlign: "center",
              background: "#d10b0b",
              padding: "6px",
              borderRadius: "8px",
              color: "#FFFFFF",
              margin: "5px 0",
            }}
          >
            La contraseña no debe tener menos de 4 caracteres ni superar los 30
            caracteres.
          </p>
          <input
            type="password"
            placeholder="Introduzca la contraseña actual"
            id={`passwordCurrent-${data.typePassword}-input-edit`}
            style={{ margin: "5px" }}
            name="currentPassword"
            onChange={(e) =>
              setPassword({ ...password, currentPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Introduzca la nueva contraseña"
            id={`password-${data.typePassword}-input-edit`}
            style={{ margin: "5px" }}
            name="newPassword"
            onChange={(e) =>
              setPassword({ ...password, newPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Repita la nueva contraseña"
            id={`passwordRepeat-${data.typePassword}-input-edit`}
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
              onClick={() =>
                validationPassword(data.typePassword, data.property)
              }
            >
              Guardar
            </button>
            <button
              className="cancel-edit"
              onClick={() => {
                document.getElementById(data.property).style.display = "none";
                document.querySelector("body").style.overflow = "auto";
                setPassword({
                  currentPassword: "",
                  newPassword: "",
                  repeatPassword: "",
                });
                setReset(true);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPasswordPart;
