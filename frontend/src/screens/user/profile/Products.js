import { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changeDate } from "../../../helpers";
import DaysInProfile from "../../../components/DaysInProfile";
import Product from "../../../components/Product";
import { changeZone } from "../../../features/function/profileSlice";

function Products() {
  const user = useSelector((state) => state.user);
  const {
    user: foundUserInformation,
    isBlocked,
    products: userProducts,
    zone
  } = useSelector((state) => state.profile);

  const dispatch = useDispatch();

  return (
    <section className="profile-products-container">
      <DaysInProfile />
      <hr />
      {!isBlocked.blocked && (
        <div className="product-divider-container">
          {userProducts.length === 0 && (
            <h1 className="thereAreNoProducts-profile">NO HAY PUBLICACIONES</h1>
          )}
          {//foundUserInformation._id === user._id &&
            foundUserInformation.objetive === "Profesor" && ( // Aqui estaba el user no el foundUser
              <div className="product-divider">
                {userProducts.length !== 0 && zone === "tasks" && (
                  <p
                    style={{
                      marginRight: "16px",
                      color: "#3282B8",
                      fontSize: "24px",
                      display: "inline-block",
                    }}
                  >
                    6/{userProducts.length}
                  </p>
                )}
                <i
                  className="fa-solid fa-list-check"
                  title="Publicaciones tomadas"
                  style={{
                    background: zone === "tasks" ? "#0f2749" : "",
                  }}
                  onClick={() => {
                    if (zone !== "tasks") dispatch(changeZone("tasks"));
                  }}
                ></i>
                <i
                  className="fa-solid fa-bars-progress"
                  title="Publicaciones creadas"
                  style={{
                    background: zone === "created" ? "#0f2749" : "",
                  }}
                  onClick={() => {
                    if (zone !== "created") dispatch(changeZone("created"));
                  }}
                ></i>
              </div>
            )}
        </div>
      )}
      {isBlocked.blocked && (
        <div className="profile-blocked">
          <i className="fas fa-ban"></i>
          <p>
            {isBlocked.userView === "from"
              ? "Has bloqueado a este usuario"
              : "Este usuario te ha bloqueado"}
          </p>
        </div>
      )}
      {!isBlocked.blocked && (
        <div className="product-zone">
          <h1 className="profile-filter-name">CATEGORÍA</h1>
          <div className="profile-products">
            {userProducts?.map((product) => (
              <Fragment key={product._id}>
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
                    title: product.title.slice(0, 30) + "...",
                    description: product.description.slice(0, 40) + "...",
                    price: product.value,
                    review: !product.stateActivated,
                  }}
                  show={
                    !product.stateActivated
                      ? product.owner === user._id
                        ? true
                        : false
                      : true
                  }
                />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Products;
