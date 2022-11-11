import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import {
  sendCompleteInformation,
  changePreferenceValue,
  getDashboardInformation,
} from "../../api";
import { thousandsSystem } from "../helpers";
import Subject from "../parts/Subject";

function CompleteForm({ userInformation, setUserInformation, zone, setZone }) {
  const [valuePerHourString, setValuePerHourString] = useState("");
  const [count, setCount] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState([]);
  const [tags, setTags] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const getSubjects = async () => {
    const result = await getDashboardInformation();
    setSubjects(result.subjects);
  };

  useEffect(() => {
    getSubjects();
  }, []);

  useEffect(() => {
    if (zone === "main") setCount(1);
    if (zone === "subjects") setCount(2);
    if (zone === "topics") setCount(3);
  }, [zone]);

  useEffect(() => {
    if (userInformation.specialty.subjects.length > 0) {
      const subjects = userInformation.specialty.subjects
        .split(",")
        .map((subject) => subject.trimLeft());
      setSelectedSubject(subjects);
    }

    if (userInformation.specialty.topics.length > 0) {
      const topics = userInformation.specialty.topics
        .split(",")
        .map((topic) => topic.trimLeft());
      setTags(topics);
    }
  }, [userInformation]);

  useEffect(() => window.scrollTo(0, 0), [count]);

  useEffect(() => {
    if (userInformation) {
      setValuePerHourString(
        userInformation.valuePerHour
          ? thousandsSystem(userInformation.valuePerHour)
          : ""
      );
    }
  }, [userInformation]);

  const [data, setData] = useState({
    firstName: userInformation.firstName ? userInformation.firstName : "",
    secondName: userInformation.secondName ? userInformation.secondName : "",
    lastName: userInformation.lastName ? userInformation.lastName : "",
    secondSurname: userInformation.secondSurname
      ? userInformation.secondSurname
      : "",
    phoneNumber: userInformation.phoneNumber ? userInformation.phoneNumber : "",
    identification: userInformation.identification
      ? userInformation.identification
      : "",
    description: userInformation.description ? userInformation.description : "",
    valuePerHour: userInformation.valuePerHour
      ? userInformation.valuePerHour
      : 0,
  });

  const [field, setField] = useState({
    firstName:
      userInformation.objetive === "Profesor" ||
      userInformation.objetive === "Alumno"
        ? userInformation.firstName
          ? true
          : false
        : true,
    secondName:
      userInformation.objetive === "Profesor"
        ? userInformation.secondName
          ? true
          : false
        : true,
    lastName:
      userInformation.objetive === "Profesor" ||
      userInformation.objetive === "Alumno"
        ? userInformation.lastName
          ? true
          : false
        : true,
    secondSurname:
      userInformation.objetive === "Profesor"
        ? userInformation.secondSurname
          ? true
          : false
        : true,
    phoneNumber:
      userInformation.objetive === "Profesor" ||
      userInformation.objetive === "Alumno"
        ? userInformation.phoneNumber
          ? true
          : false
        : true,
    identification:
      userInformation.objetive === "Profesor"
        ? userInformation.identification
          ? true
          : false
        : true,
    description:
      userInformation.objetive === "Profesor"
        ? userInformation.description
          ? true
          : false
        : true,
    valuePerHour:
      userInformation.objetive === "Profesor"
        ? userInformation.valuePerHour
          ? true
          : false
        : true,
  });
  const [sendingInformation, setSendingInformation] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    if (userInformation.objetive === "Profesor") {
      if (
        field.firstName &&
        field.secondName &&
        field.lastName &&
        field.secondSurname &&
        field.phoneNumber &&
        field.identification &&
        field.description
      )
        return true;
      else return false;
    }

    if (userInformation.objetive === "Alumno") {
      if (field.firstName && field.lastName && field.phoneNumber) return true;
      else return false;
    }
  };

  const expressions = {
    textLimit: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
    description: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{1,250}$/,
    numberLimit: /^[0-9]{5,20}$/,
    numberString: /^[0-9.]{2,20}$/,
  };

  const validateField = (expression, input) => {
    if (expression.test(input.value)) {
      document
        .querySelector(`.field_${input.name}`)
        .classList.remove("showError");
      setField({
        ...field,
        [input.name]: true,
      });
    } else {
      input.value === ""
        ? document
            .querySelector(`.field_${input.name}`)
            .classList.remove("showError")
        : document
            .querySelector(`.field_${input.name}`)
            .classList.add("showError");
      setField({
        ...field,
        [input.name]: false,
      });
    }
  };

  const changeEvent = (e, value) => {
    setData({
      ...data,
      [e.target.name]: value ? value : e.target.value,
    });

    const targetName = e.target.name;
    const input = e.target;

    if (targetName === "firstName") {
      validateField(expressions.textLimit, input);
    }
    if (targetName === "secondName") {
      validateField(expressions.textLimit, input);
    }
    if (targetName === "lastName") {
      validateField(expressions.textLimit, input);
    }
    if (targetName === "secondSurname") {
      validateField(expressions.textLimit, input);
    }
    if (targetName === "phoneNumber") {
      validateField(expressions.numberLimit, input);
    }
    if (targetName === "identification") {
      validateField(expressions.numberLimit, input);
    }
    if (targetName === "description") {
      validateField(expressions.description, input);
    }
    if (targetName === "valuePerHour") {
      validateField(expressions.numberString, input);
    }
  };

  const sendInformation = async () => {
    let information;

    if (userInformation.objetive === "Profesor") information = data;
    else {
      information = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
    }

    setSendingInformation(true);
    const user = await sendCompleteInformation({
      id: userInformation._id,
      data: information,
    });
    setUserInformation(user);
    setSendingInformation(false);

    if (userInformation.objetive === "Profesor") setZone("subjects");
    else {
      swal({
        title: "!ÉXITO!",
        text: "Tu información ha sido verificada, puedes utilizar PENSSUM con libertad.",
        icon: "success",
        timer: "3000",
        button: false,
      }).then(() => navigate(`/${userInformation.username}`));
    }
  };

  const styleProgressCircle = (circle) => {
    return {
      border: circle <= count ? "4px solid #3282B8" : "",
      background: circle <= count ? "#3282B8" : "",
      color: circle <= count ? "#FFFFFF" : "",
    };
  };

  const chosen = async (name, value) => {
    const valueInString = value.join(", ");

    const valueToChange = {
      id: userInformation._id,
      name,
      value: valueInString,
    };

    const result = await changePreferenceValue(valueToChange);
    setUserInformation(result);

    if (name === "subjects") setZone("topics");
    else {
      swal({
        title: "!ÉXITO!",
        text: "Tu información está completa, puedes usar tu cuenta con seguridad.",
        icon: "success",
        timer: "3000",
        button: false,
      }).then(() => {
        navigate(`/${userInformation.username}`);
        setZone("main");
      });
    }
  };

  const changeTopics = (e) => {
    if (e.key === "Enter") {
      let tag = e.target.value.replace(/\s+/g, " ").trimLeft().trimRight();
      if (tag.length > 0) {
        if (tags.length < 100) {
          let currentTags = [...tags];
          tag
            .split(",")
            .map(
              (tag) =>
                tag !== "" &&
                !tags.includes(tag) &&
                currentTags.push(tag.slice(0, 40))
            );
          setTags(currentTags);
        }
        e.target.value = "";
      }
    }
  };

  return (
    <div className="complete-form-container">
      {userInformation.objetive === "Profesor" && (
        <div className="progress-bar-container">
          <div
            className="progress"
            style={{ width: `${((count - 1) / (3 - 1)) * 100}%` }}
          ></div>
          <div className="progress-circle" style={styleProgressCircle(1)}>
            1
          </div>
          <div className="progress-circle" style={styleProgressCircle(2)}>
            2
          </div>
          <div className="progress-circle" style={styleProgressCircle(3)}>
            3
          </div>
        </div>
      )}
      {zone === "main" && (
        <div className="complete-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validate() && !sendingInformation) sendInformation();
            }}
          >
            <div className="complete-form-title">
              <h1>FORMULARIO</h1>
              <p>
                Debes completar este formulario para usar su cuenta con
                libertad.
              </p>
            </div>
            {(userInformation.objetive === "Profesor" ||
              userInformation.objetive === "Alumno") && (
              <div className="form-control">
                <input
                  name="firstName"
                  type="text"
                  placeholder="Primer nombre"
                  onChange={changeEvent}
                  defaultValue={userInformation.firstName}
                />
                <p className="field field_firstName">
                  El nombre no puede superar los 16 caracteres, tener ni
                  números.
                </p>
              </div>
            )}
            {userInformation.objetive === "Profesor" && (
              <div className="form-control">
                <input
                  name="secondName"
                  type="text"
                  placeholder="Segundo nombre"
                  onChange={changeEvent}
                  defaultValue={userInformation.secondName}
                />
                <p className="field field_secondName">
                  El segundo nombre no puede superar los 16 caracteres tener ni
                  números.
                </p>
              </div>
            )}
            {(userInformation.objetive === "Profesor" ||
              userInformation.objetive === "Alumno") && (
              <div className="form-control">
                <input
                  name="lastName"
                  type="text"
                  placeholder="Primer apellido"
                  onChange={changeEvent}
                  defaultValue={userInformation.lastName}
                />
                <p className="field field_lastName">
                  El apellido no puede superar los 16 caracteres tener ni
                  números.
                </p>
              </div>
            )}
            {userInformation.objetive === "Profesor" && (
              <div className="form-control">
                <input
                  name="secondSurname"
                  type="text"
                  placeholder="Segundo apellido"
                  onChange={changeEvent}
                  defaultValue={userInformation.secondSurname}
                />
                <p className="field field_secondSurname">
                  El segundo apellido nombre no puede superar los 16 caracteres
                  tener ni números..
                </p>
              </div>
            )}
            {(userInformation.objetive === "Profesor" ||
              userInformation.objetive === "Alumno") && (
              <div className="form-control">
                <input
                  name="phoneNumber"
                  type="number"
                  placeholder="Número de teléfono"
                  onChange={changeEvent}
                  defaultValue={userInformation.phoneNumber}
                />
                <p className="field field_phoneNumber">
                  El número de teléfono no puede superar los 20 dígitos.
                </p>
              </div>
            )}
            {userInformation.objetive === "Profesor" && (
              <div className="form-control">
                <input
                  name="identification"
                  type="number"
                  placeholder="Cédula de identidad"
                  onChange={changeEvent}
                  defaultValue={userInformation.identification}
                />
                <p className="field field_identification">
                  Identificación invalida.
                </p>
              </div>
            )}
            {userInformation.objetive === "Profesor" && (
              <div className="form-control">
                <input
                  name="valuePerHour"
                  type="text"
                  placeholder="Valor por hora (COP)"
                  onChange={(e) => {
                    var num = e.target.value.replace(/\./g, "");
                    if (!isNaN(num)) {
                      changeEvent(
                        e,
                        parseInt(e.target.value.replace(/\./g, ""))
                      );
                      num = num
                        .toString()
                        .split("")
                        .reverse()
                        .join("")
                        .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                      num = num
                        .split("")
                        .reverse()
                        .join("")
                        .replace(/^[.]/, "");
                      setValuePerHourString(num);
                    } else
                      setValuePerHourString(
                        e.target.value.replace(/[^\d.]*/g, "")
                      );
                  }}
                  value={valuePerHourString}
                />
                <p className="field field_valuePerHour">
                  El valor por hora no puede ser menor que 2 dígitos ni superar los 20.
                </p>
              </div>
            )}
            {userInformation.objetive === "Profesor" && (
              <div>
                <div className="complete-form-description-zone">
                  <textarea
                    name="description"
                    className="complete-form-textarea"
                    onChange={(e) => {
                      changeEvent(e);
                      document.getElementById(
                        "letter-count-description-textarea"
                      ).textContent = `${e.target.value.length}/250`;
                    }}
                    maxLength={250}
                    placeholder="Has una breve descripción de quien eres."
                    id="preference-description-input"
                    defaultValue={userInformation.description}
                  ></textarea>
                  <span id="letter-count-description-textarea">
                    {userInformation.description.length}/250
                  </span>
                </div>
                <p className="field field_description">
                  La descripción no puede superar los 250 caracteres.
                </p>
              </div>
            )}
            <div className="complete-form-button-container">
              <Link
                id="cancel-complete-form"
                to={`/${userInformation.username}`}
              >
                Cancelar
              </Link>
              <button
                style={{
                  background:
                    !validate() || sendingInformation ? "#3282B8" : "",
                  opacity: !validate() || sendingInformation ? ".4" : "",
                  cursor:
                    !validate() || sendingInformation ? "not-allowed" : "",
                }}
                id="save-complete-form"
              >
                {userInformation.objetive === "Alumno"
                  ? "Guardar"
                  : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      )}
      {zone === "subjects" && (
        <div className="complete-form-subjects">
          <div className="complete-form-title">
            <h1>MATERIAS</h1>
            <p>
              Elija hasta diez materias que disfrute enseñar. Esto nos va a ayudar a recomendarlo con estudiantes.
            </p>
          </div>
          <div className="complete-form-subjects-container">
            {subjects.map((subject) => (
              <div key={subject}>
                <Subject
                  title={subject}
                  select={true}
                  selectedSubject={selectedSubject}
                  setSelectedSubject={setSelectedSubject}
                  isActive={selectedSubject.includes(
                    subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                  )}
                />
              </div>
            ))}
          </div>
          <div className="complete-form-button-container">
            <Link id="cancel-complete-form" to={`/${userInformation.username}`}>
              Definir más tarde
            </Link>
            <button
              style={{
                background: !validate() || sendingInformation ? "#3282B8" : "",
                opacity: !validate() || sendingInformation ? ".4" : "",
                cursor: !validate() || sendingInformation ? "not-allowed" : "",
              }}
              id="save-complete-form"
              onClick={() => chosen("subjects", selectedSubject)}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {zone === "topics" && (
        <div className="complete-form-topics">
          <div className="complete-form-title">
            <h1>TEMAS</h1>
            <p>
              Elija los temas que da en cada materia. Esto es lo principal para que aparezca en la barra de búsqueda.
            </p>
          </div>
          <div className="complete-form-topics-container">
            <p>Presiona "ENTER" o añade una coma después de cada etiqueta</p>
            <ul>
              {tags.map((tag, index) => (
                <li key={tag + index}>
                  {tag}{" "}
                  <i
                    className="fa-solid fa-xmark"
                    onClick={() => {
                      setTags(tags.filter((currentTag) => currentTag !== tag));
                    }}
                  ></i>
                </li>
              ))}
              <input type="text" onKeyUp={changeTopics} />
            </ul>
            <div className="tag-details">
              <p>
                <span>{100 - tags.length}</span> Etiquetas faltantes
              </p>
              <button onClick={() => setTags([])}>Remover Todo</button>
            </div>
          </div>
          <div className="complete-form-button-container">
            <Link id="cancel-complete-form" to={`/${userInformation.username}`}>
              Definir más tarde
            </Link>
            <button
              style={{
                background: !validate() || sendingInformation ? "#3282B8" : "",
                opacity: !validate() || sendingInformation ? ".4" : "",
                cursor: !validate() || sendingInformation ? "not-allowed" : "",
              }}
              id="save-complete-form"
              onClick={() => chosen("topics", tags)}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompleteForm;
