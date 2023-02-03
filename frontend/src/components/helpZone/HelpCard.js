import { useNavigate } from "react-router-dom";

function HelpCard(data) {
  const navigate = useNavigate();

  return (
    <section
      className="help-card"
      onClick={() => {
        if (data.element !== "Link") {
          document.getElementById(data.idDark).style.display = "flex";
        } else navigate("/help/information/penssum");
      }}
    >
      <img src={data.src} alt={data.alt} />
      <div>
        <h1>{data.h1}</h1>
        <p>{data.p}</p>
      </div>
    </section>
  );
}

export default HelpCard;
