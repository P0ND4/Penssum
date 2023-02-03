import { useSelector, useDispatch } from "react-redux";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { change } from "../../features/user/zoneSlice";
import { save } from "../../features/user/userSlice";
import { changePreferenceValue  } from "../../api";
import Subject from "../../components/Subject";

function Subjects() {
  const user = useSelector((state) => state.user);
  const { subjects, selectedSubject } = useSelector(
    (state) => state.completeInformation
  );

  const navigate = useNavigate();

  const saveSubjects = async () => {
      const valueInString = selectedSubject.join(", ");
  
      const valueToChange = {
        id: user._id,
        name: 'subjects',
        value: valueInString,
      };
  
      const result = await changePreferenceValue(valueToChange);
      dispatch(save(result));
  
      dispatch(change("topics"));
      navigate('/complete/information/topics');
  };

  const dispatch = useDispatch();

  return user.objetive === "Profesor" ? (
    <div className="complete-form-subjects">
      <div className="complete-form-title">
        <h1>MATERIAS</h1>
        <p>
          Elija hasta diez materias que disfrute enseñar. Esto nos va a ayudar a
          recomendarlo con estudiantes.
        </p>
      </div>
      <div className="complete-form-subjects-container">
        {subjects.map((subject) => (
          <div key={subject}>
            <Subject
              title={subject}
              select={true}
              selectedSubject={selectedSubject}
              setSelectedSubject={(subjects) => {
                dispatch(change({ selectedSubject: subjects }));
              }}
              isActive={selectedSubject.includes(
                subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              )}
            />
          </div>
        ))}
      </div>
      <div className="complete-form-button-container">
        <Link id="cancel-complete-form" to={`/${user.username}`}>
          Definir más tarde
        </Link>
        <button
          id="save-complete-form"
          onClick={() => saveSubjects()}
        >
          Continuar
        </button>
      </div>
    </div>
  ) : (
    <Navigate to="/complete/information" />
  );
}

export default Subjects;
