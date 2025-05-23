import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeTransaction, socket, removeFiles } from "../../api";

import swal from "sweetalert";

import { changeDate, thousandsSystem } from "../../helpers/";
import { change } from "../../features/dashboard/transactionsSlice";

function PaymentCard(data) {
  const transactions = useSelector(state => state.transactions);

  const [activeInformation, setActiveInformation] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  const dispatch = useDispatch();

  const changeWidth = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => window.removeEventListener("resize", changeWidth);
  });

  const remove = async (verification) => {
    if (!data.advance && !data.verification) {
      swal({
        title: "¿Ya finalizaste la transacción?",
        text: "Recuerda que debes cumplir con los clientes, primero has la transacción, luego puedes quitarlo, si el usuario no ha colocado la información necesaria puedes esperar a que lo coloque.",
        icon: "warning",
        buttons: ["Rechazar", "Aceptar"],
      }).then(async (res) => {
        if (res) {
          await removeTransaction({
            id: data.id,
            id_user: data.ownerId ? data.ownerId : data.userId,
            amount: data.amount,
            advance: false,
            verification,
            files: data.files,
          });
          if (data.files && data.files.length > 0)
            await removeFiles({ files: data.files, dashboard: "report" });

          const currentTransactions = transactions.map((transaction) => transaction._id !== data.id);

          dispatch(change(currentTransactions));

          swal({
            title: "Éxito",
            text: "Transacción finalizada con éxito",
            icon: "success",
            button: false,
            timer: "3000",
          });
        }
      });
    } else {
      await removeTransaction({
        id: data.id,
        id_user: data.ownerId ? data.ownerId : data.userId,
        amount: data.amount,
        advance: true,
        verification,
        files: data.files,
      });
      if (data.files && data.files.length > 0)
        await removeFiles({ files: data.files, dashboard: "report" });
        const currentTransactions = transactions.map((transaction) => transaction._id !== data.id);
        dispatch(change(currentTransactions));
    }
    socket.emit("received event", data.ownerId ? data.ownerId : data.userId);
  };

  return !data.advance && !data.verification ? (
    <div className="payment-card-dashboard">
      <div className="icon-exclamation-container">
        <i
          className="fa-solid fa-circle-exclamation icon-exclamation"
          title="Mas informacion"
          onClick={() => setActiveInformation(!activeInformation)}
        ></i>
        {activeInformation && (
          <div className="payment-card-dashboard-information">
            {width <= 600 && (
              <i
                className="fas fa-chevron-left"
                id="fa-chevron-left-payment-dashboard"
                onClick={() => setActiveInformation(!activeInformation)}
              ></i>
            )}
            <p>ID del usuario: {data.userId}</p>
            <p>ID del dueño: {data.ownerId}</p>
            <p>ID de la publicación: {data.productId}</p>
            <p>orderId: {data.orderId}</p>
            <p>ID de transacción: {data.transactionId}</p>
            <p>Fecha de operación: {changeDate(data.operationDate)}</p>
            <p>Tipo de pago: {data.paymentType}</p>
            <p>Red de pago: {data.paymentNetwork}</p>
            <p>Monto: {thousandsSystem(data.amount)} COP</p>
            <p>Banco: {data.bank}</p>
            <p>Tipo: {data.accountType}</p>
            <p>Cuenta: {data.accountNumber}</p>
          </div>
        )}
      </div>
      <p>Monto: ${thousandsSystem(data.amount)} COP</p>
      {(width > 750 || (width > 500 && width <= 600)) && (
        <p>Banco: {data.bank}</p>
      )}
      {width > 850 && <p>Tipo: {data.accountType}</p>}
      {width > 1100 && <p>Cuenta: {data.accountNumber}</p>}
      <div className="payment-card-dashboard-button-container">
        <button onClick={() => remove()}>Listo</button>
      </div>
    </div>
  ) : data.verification ? (
    <div className="payment-card-dashboard">
      <div className="payment-card-divider-container">
        <div className="payment-card-divider">
          <p style={{ color: "#3282B8" }}>COMPRUEBA EL PAGO</p>
          <p>Usuario: {data.username}</p>
          <p>Monto: ${thousandsSystem(data.amount)} COP</p>
          <p>
            Producto:{" "}
            {data.productId !== undefined ? (
              <a
                style={{ color: "#3282B8" }}
                href={`/post/information/${data.productId}`}
                target="_BLANK"
                rel="noreferrer"
              >
                Ver publicación
              </a>
            ) : data.productTitle ? (
              data.productTitle
            ) : (
              "Eliminado"
            )}
          </p>
          <div className="payment-card-dashboard-button-container">
            <button onClick={() => remove(data.productId)}>Aceptar</button>
            <button
              className="remove-transition-button"
              onClick={() => remove()}
            >
              Remover
            </button>
          </div>
        </div>
        <div className="payment-card-images-container">
          {data.files.map((file) => (
            <a
              href={file.url}
              rel="noreferrer"
              target="_blank"
              key={file.uniqueId}
            >
              <img
                src={
                  file.extname === ".pdf"
                    ? "/img/pdf_image.svg"
                    : file.extname === ".doc" || file.extname === ".docx"
                    ? "/img/word_image.svg"
                    : file.extname === ".epub" ||
                      file.extname === ".azw" ||
                      file.extname === ".ibook"
                    ? "/img/document_image.svg"
                    : file.url
                }
                referrerPolicy="no-referrer"
                alt="selected_image"
              />
            </a>
          ))}
        </div>
        <p style={{ marginTop: 5, width: "100%", textAlign: "justify" }}>
          MENSAJE: {data.description}
        </p>
      </div>
    </div>
  ) : (
    <div className="payment-card-dashboard">
      <p style={{ color: "#3282B8" }}>PAGO VERIFICADO</p>
      <p>Usuario: {data.username}</p>
      <p>Monto: ${thousandsSystem(data.amount)} COP</p>
      <p>
        Producto:{" "}
        {data.productId !== undefined ? (
          <a
            style={{ color: "#3282B8" }}
            href={`/post/information/${data.productId}`}
            target="_BLANK"
            rel="noreferrer"
          >
            Ver publicación
          </a>
        ) : data.productTitle ? (
          data.productTitle
        ) : (
          "Eliminado"
        )}
      </p>
      <div className="payment-card-dashboard-button-container">
        <button onClick={() => remove()}>!Ok!</button>
      </div>
    </div>
  );
}

export default PaymentCard;
