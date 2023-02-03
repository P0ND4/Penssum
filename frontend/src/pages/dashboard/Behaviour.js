import { useState } from "react";
import { useSelector } from "react-redux";
import SubjectBackground from "../../components/SubjectBackground";

function Behaviour() {
  const information = useSelector((state) => state.dashboardInformation);

  const [IsSubjectsOpen, setSubjectsOpen] = useState(false);

  return (
    <div className="commomStylePadding">
      <div className="behaviuor-dashboard-container">
        <button
          className="behaviuor-dashboard-subjects-container"
          onClick={() => setSubjectsOpen(true)}
        >
          <section className="behaviuor-dashboard-subjects">
            <h1>Materias</h1>
            <p>Esto ayudará a la selección de materias dentro de penssum</p>
            <span>Materias totales ({information.subjects.length})</span>
          </section>
        </button>
      </div>
      {IsSubjectsOpen && (
        <SubjectBackground
          title="Materias"
          description="Configura las materias que podrán ver los profesores y alumnos."
          edit={true}
          subjects={information.subjects}
          setOpen={setSubjectsOpen}
          information={information}
        />
      )}
    </div>
  );
}

export default Behaviour;
