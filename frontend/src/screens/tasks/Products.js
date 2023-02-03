import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { changeDate, verificationOfInformation } from "../../helpers";
import Product from "../../components/Product";

function Products({ productsToPut }) {
  const products = useSelector((state) => state.products);
  const user = useSelector((state) => state.user);
  const block = useSelector((state) => state.block);

  return (
    <>
      {!block && products.length === 0 && (
        <div className="thereAreNoProducts-container">
          <div className="thereAreNoProducts">
            <h1>Aún no hay publicación</h1>
            {user.objetive !== "Profesor" && (
              <Link
                to={
                  user.username === undefined
                    ? "/signin"
                    : verificationOfInformation(user.objetive, user)
                    ? `/post/activity`
                    : "/complete/information"
                }
                className="button-thereAreNoProducts"
              >
                SÉ EL PRIMERO EN CREAR UNA
              </Link>
            )}
          </div>
        </div>
      )}
      {!block && (
        <div className="product-container">
          {productsToPut.current.map((product) => {
            return (
              <div key={product._id}>
                <Product
                  data={{
                    uniqueId: product._id,
                    image: `url(${product.linkMiniature})`,
                    dateOfDelivery:
                      product.dateOfDelivery === null
                        ? "No definido"
                        : changeDate(product.dateOfDelivery),
                    mainCategory: product.category,
                    category: product.subCategory,
                    title: product.title,
                    description: product.description.slice(0, 40) + "...",
                    price: product.value,
                    takenBy: product.takenBy,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Products;