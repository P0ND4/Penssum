import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePreferenceValue } from "../../../api";
import { save } from "../../../features/user/userSlice";
import  Cookies from 'universal-cookie';

import PreferencePart from "../../../components/user/PreferencePart";

const cookies = new Cookies();

function General() {
  const user = useSelector(state => state.user);

  const dispatch = useDispatch();

  const descriptionTimer = useRef(null);

  const changeDescription = (e, id) => {
    document.getElementById(id).textContent = `${e.target.value.length}/250`;

    if (descriptionTimer !== null) clearTimeout(descriptionTimer.current);

    descriptionTimer.current = setTimeout(async () => {
      const valueToChange = {
        id: cookies.get("id"),
        name: "description",
        value: e.target.value,
      };

      const result = await changePreferenceValue(valueToChange);

      dispatch(save(result));

      descriptionTimer.current = null;
    }, 1500);
  };

  return (
    <div className="commomStylePadding">
      <PreferencePart
        property="Primer Nombre"
        value={user.firstName === "" ? "No definido" : user.firstName}
        id="edit-first-name"
        inputType="text"
        placeholder="Ejemplo: Jose"
        idInput="first-name-input"
        name="firstName"
        typeOfUser={user.objetive}
        required={true}
        requiredFor="both"
      />
      <PreferencePart
        property="Segundo Nombre"
        value={user.secondName === "" ? "No definido" : user.secondName}
        id="edit-second-name"
        inputType="text"
        placeholder="Ejemplo: Samuel"
        idInput="second-name-input"
        name="secondName"
        typeOfUser={user.objetive}
        required={true}
        requiredFor="teacher"
      />
      <PreferencePart
        property="Primer Apellido"
        value={user.lastName === "" ? "No definido" : user.lastName}
        id="edit-last-name"
        inputType="text"
        placeholder="Ejemplo: Mendez"
        idInput="last-name-input"
        name="lastName"
        typeOfUser={user.objetive}
        required={true}
        requiredFor="teacher"
      />
      <PreferencePart
        property="Segundo Apellido"
        value={user.secondSurname === "" ? "No definido" : user.secondSurname}
        id="edit-second-surname"
        inputType="text"
        placeholder="Ejemplo: Perez"
        idInput="second-surname-input"
        name="secondSurname"
        typeOfUser={user.objetive}
        required={true}
        requiredFor="teacher"
      />
      <div className="preference-description-container">
        <div className="preference-description-zone">
          {user.objetive === "Profesor" && !user.description && (
            <i
              className="fa-solid fa-circle-exclamation field-required-icon"
              title="Campo requerido"
            ></i>
          )}
          <textarea
            className="preference-description"
            maxLength={250}
            placeholder="Has una breve descripción de quien eres."
            id="preference-description-input"
            onChange={(e) =>
              changeDescription(e, "letter-count-description-preference")
            }
            defaultValue={user.description}
          ></textarea>
          <span id="letter-count-description-preference">0/250</span>
        </div>
      </div>
    </div>
  );
}

export default General;
