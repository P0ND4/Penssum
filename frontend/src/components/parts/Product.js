import { Link } from "react-router-dom";
import { thousandsSystem } from "../helpers";

function Product({ data }) {
  const sizes = [
    "",
    "Billon",
    "Trillon",
    "Cuatrillon",
    "Quintillon",
    "Sextillon",
  ];
  const reduce = (value) => {
    const i = parseInt(Math.floor(Math.log(value) / Math.log(100000000)));
    return (
      "$" +
      thousandsSystem(Math.round(value / Math.pow(1000000000, i))) +
      " " +
      sizes[i]
    );
  };

  return (
    <Link
      to={`/post/information/${data.uniqueId}`}
      style={{ textDecoration: "none" }}
    >
      <section className="product">
        <div className="product-image" style={{ backgroundImage: data.image }}>
          <span className="product-delivery-date">
            Fecha De Entrega: <br />
            {data.dateOfDelivery}
          </span>
        </div>
        <div className="product-content-container">
          <div className="product-content">
            <p className="product-main-category">{data.mainCategory}</p>
            <p className="product-category">
              {data.category}: {data.title}
            </p>
            <p className="description">{data.description}</p>
          </div>
          <p className="product-price">Precio: {reduce(data.price)}</p>
        </div>
        {data.review === true ? (
          <i className="fas fa-history review-product"></i>
        ) : (
          <></>
        )}
      </section>
    </Link>
  );
}

export default Product;
