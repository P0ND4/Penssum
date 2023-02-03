import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { changeDashboardPreference } from "../api";
import { change } from "../features/dashboard/informationSlice";

function SubjectBackground({
  title,
  description,
  subjects,
  setOpen,
  edit,
  information,
  setInformation
}) {
  const [subjectsEdit, setSubjectsEdit] = useState([]);
  const [subjectText, setSubjectText] = useState("");
  const [search, setSearch] = useState("");
  const [isSame, setSame] = useState(true);

  const dispatch = useDispatch();
  const origianlArray = useRef(information);
  const array = useRef([]);

  const save = async () => {
    dispatch(change({ ...information, subjects: array.current }));
    await changeDashboardPreference({
      name: "subjects",
      value: array.current,
    });
  };

  const addSubject = (e) => {
    e.preventDefault();
    const text = subjectText.trimEnd().trimStart();

    if (text.length > 0) {
      const currentSubjects = search !== "" ? subjectsEdit : array.current;

      for (let subject of subjectsEdit) {
        if (
          subject
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") !==
          text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        ) {
          if (search === "") currentSubjects.push(text);
          else {
            if (
              text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .includes(
                  search
                    .toLowerCase()
                    .trimEnd()
                    .trimStart()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                )
            ) {
              currentSubjects.push(text);
              array.current.push(text);
            }
          }
          break;
        }
      }

      setSubjectText("");
      setSubjectsEdit(currentSubjects.sort());
      setSame(subjects !== array.current);
    }
  };

  useEffect(() => {
    if (subjects.length !== 0) {
      array.current = subjects;
      setSubjectsEdit(subjects);
    }
  }, [subjects]);

  useEffect(() => {
    const filter = [];

    for (let subject of array.current) {
      if (
        subject
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(
            search
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
          )
      ) {
        filter.push(subject);
      }
    }
    setSubjectsEdit(filter);
  }, [search, array]);

  const deleteSubject = (text) => {
    setSame(subjects !== array.current);
    array.current = array.current.filter((subject) => subject !== text);
    setSubjectsEdit(subjectsEdit.filter((subject) => subject !== text));
  };

  return (
    <div
      className="subject-background-container"
      onClick={(e) =>
        e.target.className === "subject-background-container" && setOpen(false)
      }
    >
      <div className="subject-background">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="form-control">
          {edit && (
            <form
              onSubmit={addSubject}
              style={{ marginBottom: 10, display: "flex" }}
            >
              <input
                value={subjectText}
                maxLength={35}
                onChange={(e) =>
                  e.target.value.length <= 35 && setSubjectText(e.target.value)
                }
                placeholder="Agregar materia"
                style={{ background: "#DDDDDD" }}
              />
              <button
                className="footer-subject-background-button-save"
                style={{
                  background:
                    subjectText.trimEnd().trimStart().length === 0
                      ? "#3282B8"
                      : "",
                  opacity:
                    subjectText.trimEnd().trimStart().length === 0 ? ".4" : "",
                  cursor:
                    subjectText.trimEnd().trimStart().length === 0
                      ? "not-allowed"
                      : "",
                  borderRadius: 40,
                  padding: "0 20px",
                }}
              >
                Crear
              </button>
            </form>
          )}
          <input
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "#DDDDDD" }}
          />
        </div>
        <div className="subject-background-content">
          {subjectsEdit?.map((subject) => (
            <div
              key={subject}
              style={{ cursor: !edit ? "pointer" : "" }}
              onClick={() => {
                if (!edit) {
                  if (!information.includes(subject))
                    setInformation([...information, subject]);
                  else
                    setInformation(
                      information.filter((item) => item !== subject)
                    );
                }
              }}
              className="show-subject"
            >
              <p>{subject}</p>
              {edit && (
                <i
                  className="fa-solid fa-circle-xmark"
                  id="xmark-subject"
                  onClick={() => deleteSubject(subject)}
                ></i>
              )}
              {!edit && information.includes(subject) && (
                <i className="fa-solid fa-circle-check" id="xmark-subject"></i>
              )}
            </div>
          ))}
        </div>
        <div className="footer-subject-background">
          <button
            className="footer-subject-background-cancel"
            onClick={() => {
              setOpen(false);
              if (!edit) {
                setInformation(origianlArray.current);
              }
            }}
          >
            Salir
          </button>
          <button
            className="footer-subject-background-save"
            style={{
              background: edit && isSame ? "#3282B8" : "",
              opacity: edit && isSame ? ".4" : "",
              cursor: edit && isSame ? "not-allowed" : "",
            }}
            onClick={() => {
              if (edit) {
                if (!isSame) {
                  save();
                  setOpen(false);
                }
              } else setOpen(false);
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubjectBackground;
