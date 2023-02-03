import { useEffect, useState } from "react";

function Subject({
  title,
  description,
  select,
  selectedSubject,
  setSelectedSubject,
  isActive,
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isActive) setActive(true);
  }, [isActive]);

  function selectSubject() {
    const titleChange = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (active) {
      setActive(false);
      setSelectedSubject(
        selectedSubject.filter((subject) => subject !== titleChange)
      );
    }

    if (selectedSubject.length <= 9) {
      if (!active) setSelectedSubject([...selectedSubject, titleChange]);
      else
        setSelectedSubject(
          selectedSubject.filter((subject) => subject !== titleChange)
        );
      setActive(!active);
    }
  }

  return (
    <div
      className="subject-container"
      style={{
        background: `linear-gradient(45deg, #1B262C${
          active ? "CC" : "FF"
        },#2c373d${active ? "CC" : "FF"})`,
      }}
      onClick={() => {
        if (select) selectSubject(title);
      }}
    >
      {active && (
        <i id="check-subject" className="fa-solid fa-circle-check"></i>
      )}
      <div className="subject">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default Subject;
