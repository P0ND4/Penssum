import { useSelector, useDispatch } from "react-redux";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { changePreferenceValue } from "../../api";
import { save } from "../../features/user/userSlice";
import { clean } from "../../features/user/zoneSlice";
import swal from "sweetalert";
import { change } from "../../features/user/completeInformationSlice";

function Topics() {
  const user = useSelector((state) => state.user);
  const { tags } = useSelector((state) => state.completeInformation);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveTopics = async () => {
    const valueInString = tags.join(", ");

    const valueToChange = {
      id: user._id,
      name: "topics",
      value: valueInString,
    };

    const result = await changePreferenceValue(valueToChange);
    dispatch(save(result));

    swal({
      title: "!ÉXITO!",
      text: "Tu información está completa, puedes usar tu cuenta con seguridad.",
      icon: "success",
      timer: "3000",
      button: false,
    }).then(() => {
      navigate(`/${user.username}`);
      dispatch(clean());
    });
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
          dispatch(change({ tags: currentTags }));
        }
        e.target.value = "";
      }
    }
  };

  return user.objetive === "Profesor" ? (
    <div className="complete-form-topics">
      <div className="complete-form-title">
        <h1>TEMAS</h1>
        <p>
          Elija los temas que da en cada materia. Esto es lo principal para que
          aparezca en la barra de búsqueda.
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
                  dispatch(
                    change({
                      tags: tags.filter((currentTag) => currentTag !== tag),
                    })
                  );
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
          <button onClick={() => dispatch(change({ tags: [] }))}>
            Remover Todo
          </button>
        </div>
      </div>
      <div className="complete-form-button-container">
        <Link id="cancel-complete-form" to={`/${user.username}`}>
          Definir más tarde
        </Link>
        <button id="save-complete-form" onClick={() => saveTopics()}>
          Guardar
        </button>
      </div>
    </div>
  ) : (
    <Navigate to="/complete/information" />
  );
}

export default Topics;
