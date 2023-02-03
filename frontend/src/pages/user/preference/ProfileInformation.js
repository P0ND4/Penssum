import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePreferenceValue } from "../../../api";
import { save } from "../../../features/user/userSlice";
import { change } from "../../../features/user/zoneSlice";
import PreferencePart from "../../../components/user/PreferencePart";
import PreferenceToggle from "../../../components/user/PreferenceToggle";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function ProfileInformation() {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeAvailability = () => {
    const days = user.availability;
    if (
      days.monday &&
      days.tuesday &&
      days.wednesday &&
      days.thursday &&
      days.friday &&
      days.saturday &&
      days.sunday
    ) {
      return "Todos los dias";
    } else if (
      !days.monday &&
      !days.tuesday &&
      !days.wednesday &&
      !days.thursday &&
      !days.friday &&
      !days.saturday &&
      !days.sunday
    ) {
      return "Ningun dia";
    } else {
      return `
                ${days.monday ? "Lunes" : ""} 
                ${days.tuesday ? "Martes" : ""} 
                ${days.wednesday ? "Miercoles" : ""} 
                ${days.thursday ? "Jueves" : ""} 
                ${days.friday ? "Viernes" : ""} 
                ${days.saturday ? "Sabado" : ""} 
                ${days.sunday ? "Domingo" : ""}
            `;
    }
  };

  const changeInformation = async (name, information) => {
    if (document.getElementById("CI"))
      document.getElementById("CI").style.display = "none";
    if (document.getElementById("city"))
      document.getElementById("city").style.display = "none";

    const valueToChange = {
      id: cookies.get("id"),
      name: name,
      value: information,
    };

    const result = await changePreferenceValue(valueToChange);

    dispatch(save(result));
  };

  const changeProffesorInformation = async (name, information, containerId) => {
    document.getElementById(containerId).style.display = "none";

    const nameVerify = name === "subjects" ? [information] : [information];

    const valueToChange = {
      id: cookies.get("id"),
      name: name,
      value: nameVerify,
    };

    const result = await changePreferenceValue(valueToChange);

    dispatch(save(result));
  };

  return (
    <div className="commomStylePadding">
      {user.objetive === "Profesor" && (
        <div className="preference-CI-container">
          {user.identification === null && (
            <i
              className="fa-solid fa-circle-exclamation field-required-icon"
              title="Campo requerido"
            ></i>
          )}
          <div className="preference-CI-zone">
            <div className="preference-CI-information">
              <p>Número de identidad</p>
              <h4>
                {user.identification === null
                  ? "No definido"
                  : user.identification}
              </h4>
            </div>
            <p className="preference-CI-description">
              El número de identidad es para llevar el control de los usuarios,
              también para evitar el mal uso de nuestra aplicación, esto nadie
              lo podrá ver solo usted. (este campo es obligatorio para el
              Profesor).
            </p>
          </div>
          <button
            id="edit-CI"
            onClick={() => {
              document.getElementById("CI").style.display = "flex";
            }}
          >
            Editar
          </button>
        </div>
      )}
      {user.objetive === "Profesor" && (
        <div className="dark" id="CI">
          <div className="dark-input">
            <h1>Introduce el número de identidad</h1>
            <input
              type="number"
              placeholder="Introduzca su número de indentidad"
              id="CI-input"
              defaultValue={user.identification}
            />
            <div className="dark-button-container">
              <button
                className="save-edit"
                id="edit-ci"
                onClick={() =>
                  changeInformation(
                    "identification",
                    document.getElementById("CI-input").value
                  )
                }
              >
                Guardar
              </button>
              <button
                className="cancel-edit"
                onClick={() => {
                  document.getElementById("CI").style.display = "none";
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="preference-city-container" style={{ marginTop: "10px" }}>
        <div className="preference-city-zone">
          <div className="preference-city-information">
            <p>Ciudad</p>
            <h4>
              {user.city === null || user.city === "city"
                ? "No definido"
                : user.city}
            </h4>
          </div>
          <p className="preference-city-description">
            La ciudad es importante para que aparezca en los filtros de
            búsqueda.
          </p>
        </div>
        <button
          id="edit-city"
          onClick={() => {
            document.getElementById("city").style.display = "flex";
          }}
        >
          Editar
        </button>
      </div>
      <div className="dark" id="city">
        <div className="dark-input">
          <h1>¿En qué estado te encuentras?</h1>
          <select id="filter-city-change" defaultValue="city">
            <option value="city">Ciudad</option>
            <option value="Bogota">Bogotá</option>
            <option value="Valle del cauca">Valle del cauca</option>
            <option value="Antioquia">Antioquia</option>
            <option value="Satander">Santander</option>
            <option value="Amazonas">Amazonas</option>
            <option value="Aracua">Aracua</option>
            <option value="Atlantico">Atlantico</option>
            <option value="Bolivar">Bolivar</option>
            <option value="Boyaca">Boyaca</option>
            <option value="Caldas">Caldas</option>
            <option value="Caqueta">Caqueta</option>
            <option value="Casanare">Casanare</option>
            <option value="Cauca">Cauca</option>
            <option value="Cesar">Cesar</option>
            <option value="Choco">Choco</option>
            <option value="Cordoba">Cordoba</option>
            <option value="Cundinamarca">Cundinamarca</option>
            <option value="Guainia">Guainia</option>
            <option value="Guaviare">Guaviare</option>
            <option value="Huila">Huila</option>
            <option value="La guajira">La guajira</option>
            <option value="Magdalena">Magdalena</option>
            <option value="Meta">Meta</option>
            <option value="Nariño">Nariño</option>
            <option value="Norte de santander">Norte de santander</option>
            <option value="Putumayo">Putumayo</option>
            <option value="Quindio">Quindio</option>
            <option value="Risaralda">Risaralda</option>
            <option value="San andres">San andres</option>
            <option value="Sucre">Sucre</option>
            <option value="Tolima">Tolima</option>
            <option value="Vaupes">Vaupes</option>
            <option value="Vichada">Vichada</option>
          </select>
          <div className="dark-button-container">
            <button
              className="save-edit"
              id="edit-ci"
              onClick={() =>
                changeInformation(
                  "city",
                  document.getElementById("filter-city-change").value
                )
              }
            >
              Guardar
            </button>
            <button
              className="cancel-edit"
              onClick={() => {
                document.getElementById("city").style.display = "none";
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      {user.objetive === "Profesor" && (
        <PreferencePart
          property="Años de experiencia"
          value={
            user.yearsOfExperience === null
              ? "No definido"
              : user.yearsOfExperience
          }
          id="edit-preference-years-experience"
          width="74%"
          inputType="number"
          placeholder="Ejemplo: 6"
          idInput="years-experience-input"
          name="yearsOfExperience"
        />
      )}
      <PreferencePart
        property="Número de teléfono"
        value={user.phoneNumber === null ? "No definido" : user.phoneNumber}
        id="edit-preference-phone-number"
        width="74%"
        inputType="number"
        placeholder="Ejemplo: 5722329200"
        idInput="phone-number-input"
        name="phoneNumber"
        typeOfUser={user.objetive}
        required={true}
        requiredFor="both"
      />
      <PreferencePart
        property="Disponibilidad"
        value={changeAvailability()}
        id="edit-availability"
        width="74%"
        inputType="checkbox"
        informationType="days"
        name="availability"
        userInformation={user}
      />
      {user.objetive === "Profesor" && (
        <div
          className="preference-faculty-container"
          style={{ marginTop: "10px" }}
        >
          <div className="preference-faculty-zone">
            <div className="preference-faculty-information">
              <p>Facultad</p>
              <h4>
                {user.faculties.length === 0
                  ? "No definido"
                  : user.faculties[0]}
              </h4>
            </div>
            <p className="preference-faculty-description">
              La facultad te define a qué grupo te especializas a dar clases.
            </p>
          </div>
          <button
            id="edit-faculty"
            onClick={() => {
              document.getElementById("faculties").style.display = "flex";
            }}
          >
            Editar
          </button>
        </div>
      )}
      {user.objetive === "Profesor" && (
        <div className="dark" id="faculties">
          <div className="dark-input">
            <h1>¿A qué facultad te diriges?</h1>
            <select
              id="filter-faculties-change"
              defaultValue="-- Seleccione facultad --"
            >
              <option value="-- Seleccione facultad --" hidden>
                -- Seleccione facultad --
              </option>
              <option value="Infantil">Infantil</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Media superior">Media superior</option>
              <option value="Superior">Superior</option>
              <option value="Post universitaria">Post universitaria</option>
              <option value="Universitaria">Universitaria</option>
              <option value="Ingenieria">Ingeniería</option>
            </select>
            <div className="dark-button-container">
              <button
                className="save-edit"
                id="edit-ci"
                onClick={() =>
                  changeProffesorInformation(
                    "faculties",
                    document.getElementById("filter-faculties-change").value,
                    "faculties"
                  )
                }
              >
                Guardar
              </button>
              <button
                className="cancel-edit"
                onClick={() => {
                  document.getElementById("faculties").style.display = "none";
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {user.objetive === "Profesor" && (
        <PreferencePart
          property="Valor por hora"
          value={
            user.valuePerHour === null || user.valuePerHour === 0
              ? "No definido"
              : user.valuePerHour
          }
          id="edit-value-per-hour"
          inputType="text"
          thousandsSystem={true}
          placeholder="Ejemplo: 11"
          idInput="value-per-hour-input"
          name="valuePerHour"
        />
      )}
      {user.objetive === "Profesor" && (
        <div
          className="preference-subject-container"
          style={{ marginTop: "10px" }}
        >
          <div className="preference-subject-zone">
            <div className="preference-subject-information">
              <p style={{ marginRight: 10 }}>Asignatura y temas</p>
              <h4>
                {user.specialty.subjects.length === 0
                  ? "No definido"
                  : user.specialty.subjects}
              </h4>
            </div>
            <p className="preference-subject-description">
              Puedes elegir las asignaturas el cual se especializan.
            </p>
          </div>
          <button
            id="edit-faculty"
            onClick={() => {
              dispatch(change("subjects"));
              navigate("/complete/information/subjects");
            }}
          >
            Editar
          </button>
        </div>
      )}
      <PreferenceToggle
        idButton="class-button-toggle"
        idContainer="button-toggle-class"
        h4="Clases virtuales"
        p="¿Tienes la disponibilidad de tener clases virtuales?"
        name="virtualClasses"
        value={user.virtualClasses}
      />
      <PreferenceToggle
        idButton="presentClass-button-toggle"
        idContainer="button-toggle-presentClass"
        h4="Clases presenciales"
        p="¿Tienes la disponibilidad de tener clases presenciales?"
        name="faceToFaceClasses"
        value={user.faceToFaceClasses}
      />
    </div>
  );
}

export default ProfileInformation;
