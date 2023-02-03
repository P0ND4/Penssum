import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thousandsSystem, changeDate } from "../../helpers";
import CoverImageInformation from "../../components/CoverImageInformation";

function Header({ position }) {
  const products = useSelector(state => state.products);
  const block = useSelector(state => state.block);

  return (
    <header className="main-tasks-carousel">
      {!block && products.length > 0 ? (
        <div className="main-image-container_carousel">
          {products.map(
            (product, index) =>
              index < 9 && (
                <Link
                  className="carousel-image"
                  to={`/post/information/${product._id}`}
                  style={{
                    background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url(${product.linkMiniature}) center`,
                    backgroundSize: "cover",
                    transform: `translateX(-${position}00%)`,
                    textDecoration: "none",
                  }}
                  key={product._id}
                >
                  <CoverImageInformation
                    title={product.title}
                    category={product.category}
                    customCategory={product.customCategory}
                    dateOfDelivery={
                      product.dateOfDelivery === null
                        ? "Indefinido"
                        : changeDate(product.dateOfDelivery)
                    }
                    value={
                      product.value === 0
                        ? "Ayuda gratuita"
                        : `$${thousandsSystem(product.value)}`
                    }
                    description={product.description}
                    votes={product.votes}
                  />
                </Link>
              )
          )}
        </div>
      ) : block ? (
        <div
          className="carousel-image"
          style={{
            background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url("/img/Penssum-cover.jpeg")`,
          }}
        >
          <div className="main-image-info-no-products">
            <h1 className="title-carousel">Estás bloqueado :(</h1>
            <p className="carousel-image-description">
              Hemos detectado que has violado las políticas del uso de Penssum,
              queremos hacer un ambiente sano y seguro, hemos visto que no has
              cumplido con las políticas del uso de Pénsum, por ende esta cuenta
              queda bloqueada permanentemente, no podrá hacer uso de Penssum por
              medio de esta cuenta, no podrá eliminar la cuenta ni los datos
              registrados en la misma, de verdad, disculpe las molestias
              ocasionadas, pero nos hemos visto en la obligación de bloquearlo.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="carousel-image"
          style={{
            background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url("/img/Penssum-cover.jpeg")`,
          }}
        >
          <div className="main-image-info-no-products">
            <h1 className="title-carousel">Penssum</h1>
            <p className="carousel-image-description">
              Penssum es una plataforma de asistencia académica, que permite a
              los estudiantes conectarse con los mejores docentes en soluciones
              inmediatas a las actividades diarias curriculares más exigentes,
              es el mejor aliado estratégico para fortalecer y obtener
              conocimientos y las mejores calificaciones de una manera fácil,
              ágil y segura.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
