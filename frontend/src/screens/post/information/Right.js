import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Events from "./Events";
import ExtraInformation from "./ExtraInformation";
import Information from "./Information";
import Finalize from "./Finalize";

function Right() {
  const { productFound } = useSelector((state) => state.postInformation);

  return (
    <section className="post-information-card-container">
      <Information />
      <div className="post-value-container">
        <Finalize />
        <ExtraInformation />
      </div>
      <Events />
      <div style={{ marginTop: "20px" }}>
        <Link
          to={`/${productFound.creatorUsername}`}
          style={{ textDecoration: "none" }}
        >
          <button id="goToProfile">Ir al perfil del creador</button>
        </Link>
      </div>
    </section>
  );
}

export default Right;
