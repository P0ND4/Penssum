import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  removePayment,
  removeFiles,
  deleteProduct,
  getProducts,
  socket,
} from "../../../api";
import { change } from "../../../features/product/informationSlice";
import { save } from "../../../features/product/productsSlice";
import swal from "sweetalert";

function Information() {
  const user = useSelector((state) => state.user);
  const { productFound, sendingInformation, task } = useSelector(
    (state) => state.postInformation
  );

  const { post_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const eventZone = useRef();

  const deletePayment = () => {
    swal({
      title: "¿Quieres eliminar el pago?",
      text: "Si no pagas no tendrás la verificación de pago por medio de nuestra plataforma y tendrás que llegar a un acuerdo con el profesor respecto al pago.",
      icon: "warning",
      buttons: ["No estoy seguro", "Estoy seguro"],
    }).then(async (res) => {
      if (res) {
        dispatch(change({ sendingInformation: true }));
        const productUpdated = await removePayment({ post_id });
        dispatch(change({ productFound: productUpdated }));
        dispatch(change({ sendingInformation: false }));
        swal({
          title: "!ELIMINADO!",
          text: "Se ha eliminado el pago pendiente por realizar",
          icon: "success",
          timer: "2000",
          button: false,
        });
      }
    });
  };

  const removeProduct = () => {
    swal({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar el producto con todas las ofertas?.",
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        const takenBy = productFound.takenBy;
        eventZone.current.style.display = "none";
        await removeFiles({ files: productFound.files, activate: true });
        await deleteProduct({ id: post_id, notification: false });
        socket.emit("received event", takenBy);
        socket.emit("product deleted", {
          userID: productFound.takenBy,
          finished: false,
        });
        const currentProductsCollections = await getProducts({
          blockSearch: user._id,
        });
        dispatch(save(currentProductsCollections));
        navigate("/");
      }
    });
  };

  return (
    <div className="post-information-card">
      {!productFound.stateActivated ? (
        <h1 style={{ color: "#ff9900", margin: "10px 0" }}>
          <i
            className="fas fa-history"
            style={{ color: "#ff9900", fontSize: "35px" }}
          ></i>{" "}
          Este producto se encuentra en revisión.
        </h1>
      ) : (
        ""
      )}
      {productFound.owner === user._id &&
        (productFound.paymentType === "PSE" ||
          productFound.paymentType === "cash" ||
          productFound.paymentType === "bank") &&
        !productFound.advancePayment && (
          <h1 style={{ color: "#ff9900" }}>
            PAGO PENDIENTE
            {!sendingInformation && (
              <a
                disabled={sendingInformation}
                href={productFound.paymentLink}
                target="_BLANK"
                rel="noreferrer"
                title={
                  productFound.paymentType === "cash" ||
                  productFound.paymentType === "bank"
                    ? "Recibo"
                    : "Finalizar pago"
                }
              >
                <i
                  className="fa-solid fa-flag-checkered"
                  id="fa-flag-checkered"
                ></i>
              </a>
            )}
            <i
              className="fa-solid fa-trash"
              id="fa-trash"
              title="Eliminar pago"
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
              onClick={() => {
                if (!sendingInformation) deletePayment();
              }}
            ></i>
          </h1>
        )}
      {productFound.advancePayment && (
        <h1 className="main-post-information-payment">
          <img src="/img/penssum-transparent.png" alt="icon-logo" />
          <span>PAGO VERIFICADO</span>{" "}
          <i
            className="fa fa-check"
            style={{ fontSize: "40px", color: "#3282B8" }}
          ></i>
        </h1>
      )}
      {productFound.owner === user._id && (
        <div className="main-post-information" ref={eventZone}>
          <h1 className="main-post-information-category">
            <span>{productFound.category}</span>
          </h1>
          {task === false && (
            <button
              title="Borrar producto"
              id="delete-product"
              onClick={() => removeProduct()}
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
        </div>
      )}
      <h1 className="main-post-information-subcategory">
        <span>{productFound.subCategory}</span>
      </h1>
      <h1 className="post-information-subcategory">
        <span>{productFound.customCategory}</span>
      </h1>
      <h1 className="post-information-title">
        Tema: <span>{productFound.title}</span>
      </h1>
      <p className="post-information-description">{productFound.description}</p>
    </div>
  );
}

export default Information;
