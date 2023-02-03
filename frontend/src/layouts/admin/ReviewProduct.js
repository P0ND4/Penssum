import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  acceptProduct,
  removeFiles,
  getProducts,
  socket,
} from "../../api";
import { change as changeInformation } from "../../features/dashboard/informationSlice";
import { change as changeReview } from "../../features/dashboard/reviewSlice";
import { save } from "../../features/product/productsSlice";
import { thousandsSystem } from "../../helpers";

function ReviewProduct({ data }) {
  const information = useSelector(state => state.information);

  const dispatch = useDispatch();

  const removeProduct = async () => {
    await removeFiles({ files: data.product.files, activate: true });
    const result = await deleteProduct({ id: data.id, notification: true });
    socket.emit("received event", data.owner);
    dispatch(changeInformation({ ...information, productsToReview: result.length }));
    dispatch(changeReview(result));
    const productsObtained = await getProducts();
    dispatch(save(productsObtained));
  };

  const allowProduct = async () => {
    const result = await acceptProduct(data.id);
    socket.emit("received event", data.owner);
    dispatch(changeInformation({ ...information, productsToReview: result.length }));
    dispatch(changeReview(result));
    const productsObtained = await getProducts();
    dispatch(save(productsObtained));
  };

  const sizes = ["","Billon","Trillon","Cuatrillon","Quintillon","Sextillon"];

  const reduce = (value) => {
    const i = parseInt(Math.floor(Math.log(value) / Math.log(1000000000)));
    return (
      "$" +
      thousandsSystem(Math.round(value / Math.pow(1000000000, i), 2)) +
      " " +
      sizes[i]
    );
  };

  return (
    <section>
      <a
        style={{ textDecoration: "none" }}
        href={`/post/information/${data.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="product reviewProduct">
          <div
            className="product-image"
            style={{ backgroundImage: data.image }}
          >
            <span className="product-delivery-date">
              Fecha De Entrega: <br />
              {data.dateOfDelivery}
            </span>
          </div>
          <div className="product-content">
            <p className="product-main-category">{data.mainCategory}</p>
            <p className="product-category">
              {data.category}: {data.title}
            </p>
            <p className="description">{data.description}</p>
          </div>
          <p className="product-price">
            {data.price && data.price > 0
              ? `Precio: ${reduce(data.price)}`
              : "Ayuda gratuita"}
          </p>
        </div>
      </a>
      <div className="review-products-button">
        <button id="approve" onClick={() => allowProduct()}>
          Aprobar
        </button>
        <button id="disapproved" onClick={() => removeProduct()}>
          Desaprobar
        </button>
      </div>
    </section>
  );
}

export default ReviewProduct;