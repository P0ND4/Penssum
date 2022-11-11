import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  removeOffer,
  makeCounteroffer,
  socket,
  acceptOffer,
} from "../../../api";
import { thousandsSystem } from "../../helpers";
import swal from "sweetalert";
import PayuForm from "../PayuForm";
import FloatingData from "../FloatingData";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function OfferCard(data) {
  const [paymentHandler, setPaymentHandler] = useState(false);
  const [activeCounterOffer, setActiveCounterOffer] = useState(false);
  const [valueCounterOffer, setValueCounterOffer] = useState(null);

  const dataAccept = useCallback(async () => {
    const result = await acceptOffer({
      from: cookies.get("id"),
      id_user: data.user_id,
      id_product: data.product_id,
      pay: paymentHandler,
    });

    let newArrayOfOffers = [];

    data.offers.forEach((offer, index) => {
      if (index !== data.index) newArrayOfOffers.push(offer);
      if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
    });

    //if (result.offer.isThePayment || data.offer === 0 || result.product.advancePayment || data.productValue > data.offerInNumber) {
    if (data.offerInNumber !== 0 && !result.product.advancePayment) {
      socket.emit(
        "send_message",
        cookies.get("id"),
        data.user_id,
        `
                    Hola, soy el dueño del servicio ${
                      data.productTitle
                    }, me parece bien la oferta propuesta de ${
          data.offerInNumber === 0 ? "Gratis" : `$${data.offer}`
        } me gustaría Llegar a un acuerdo con usted de cómo se haría realidad la implementación del servicio propuesto.
                    `
      );

      swal({
        title: "Aceptado",
        text: "!Oferta aceptada con éxito! Se envió un mensaje automático al usuario para preparar la conversación sobre el servicio, puede ir a la mensajería para hablar con el usuario.",
        icon: "success",
        button: true,
      });
    } else {
      swal({
        title: "Aceptado",
        text: "!Oferta aceptada con éxito!",
        icon: "success",
        button: true,
      });
    }
    /*} else {
                swal({
                    title: 'Aceptado',
                    text: `!Oferta aceptada con exito! el usuario puede pagar la cantidad de $${result.offer.amountString} para entrar a tu servicio.`,
                    icon: 'success',
                    button: true,
                });
            };*/

    data.setActivatePayment(false);

    socket.emit("received event", data.user_id);
    socket.emit("offer event", {
      userID: data.user_id,
      post_id: data.product_id,
    });
  }, [data, paymentHandler]);

  const sendCounterValue = useCallback(
    async (value) => {
      await makeCounteroffer({
        from: cookies.get("id"),
        to: data.user_id,
        value: thousandsSystem(value),
        valueInNumber: value,
        productId: data.product_id,
        pay: paymentHandler,
      });

      let newArrayOfOffers = [];

      data.offers.forEach((offer, index) => {
        if (index !== data.index) newArrayOfOffers.push(offer);
        if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
      });

      socket.emit("received event", data.user_id);
      socket.emit("offer event", {
        userID: data.user_id,
        post_id: data.product_id,
      });

      swal({
        title: "Enviado",
        text: "Contraoferta enviada con éxito",
        icon: "success",
        button: true,
      });
    },
    [data, paymentHandler]
  );

  useEffect(() => {
    if (paymentHandler) {
      if (valueCounterOffer) sendCounterValue(valueCounterOffer);
      else dataAccept();
    }
  }, [paymentHandler, dataAccept, sendCounterValue, valueCounterOffer]);

  const removeOF = async ({ id_user, id_product, notification, from }) => {
    await removeOffer({ id_user, id_product, notification, from });
    socket.emit("received event", id_user);
    socket.emit("offer event", {
      userID: data.user_id,
      post_id: data.product_id,
    });

    let newArrayOfOffers = [];

    data.offers.forEach((offer, index) => {
      if (index !== data.index) newArrayOfOffers.push(offer);
      if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
    });
  };

  const pay = () => {
    if (
      !data.advancePayment &&
      (data.paymentType === "bank" ||
        data.paymentType === "PSE" ||
        data.paymentType === "cash")
    ) {
      swal({
        title: "NO HAS PAGADO",
        text: `Hemos detectado que no has pagado y utilizaste este método (${
          data.paymentType === "bank"
            ? "PAGO EN BANCO"
            : data.paymentType === "cash"
            ? "PAGO EN EFECTIVO"
            : "PAGO POR PSE"
        }) para hacer la transacción, te sumaremos la diferencia de pago y total del producto, si no deseas pagar, por favor elimine el método de pago que colocaste en la publicación, si activas un método de pago diferente a (PAGO POR TARJETA), deberás comprobar el pago, de lo contrario no quedará la publicación como pago verificado.`,
        icon: "info",
        button: "Gracias",
      }).then(() => data.setActivatePayment(true));
    } else data.setActivatePayment(true);
  };

  const sendCounteroffer = (value) => {
    if (/^[0-9]{0,20}$/.test(value)) {
      setValueCounterOffer(value);
      if (
        data.productValue < value &&
        (data.advancePayment ||
          data.paymentType === "bank" ||
          data.paymentType === "PSE" ||
          data.paymentType === "cash")
      )
        pay();
      else sendCounterValue(value);
    }
  };

  const sendMessage = (transmitter, receiver) => {
    swal({
      title: "ESCRIBE EL MENSAJE",
      content: {
        element: "input",
        attributes: {
          placeholder: "Mensaje",
          type: "text",
        },
      },
      button: "Enviar",
    }).then((value) => {
      if (value === null) return;

      if (value) {
        socket.emit("send_message", transmitter, receiver, value);
        swal({
          title: "Enviado",
          text: "Mensaje enviado con éxito",
          icon: "success",
          button: "Gracias",
        });
      }
    });
  };

  const accept = async () => {
    if (
      data.productValue < data.offerInNumber &&
      (data.advancePayment ||
        data.paymentType === "bank" ||
        data.paymentType === "PSE" ||
        data.paymentType === "cash")
    )
      pay();
    else dataAccept();
  };

  return (
    <div className="offer-container">
      <div className="offer-information">
        <div className="offer-username">
          <h3>
            <Link to={`/${data.username}`}>{data.username}</Link>
          </h3>
          <p>
            {data.name} {data.lastname}
          </p>
        </div>
        <h3 className="offer-value">
          {data.offerInNumber !== 0 ? `$${data.offer}` : "GRATIS"}
        </h3>
      </div>
      <div className="post-control-options">
        <button
          title="Enviar mensaje"
          onClick={() => sendMessage(cookies.get("id"), data.user_id)}
        >
          <i className="fas fa-envelope"></i>
        </button>
        <button
          title="Hacer una contraoferta"
          onClick={() => {
            setActiveCounterOffer(true); /*sendCounteroffer()*/
          }}
        >
          <i className="fas fa-money-bill-alt"></i>
        </button>
        <button
          title="Aceptar oferta"
          id="offer-check"
          onClick={() => accept()}
        >
          <i className="fas fa-check"></i>
        </button>
        <button
          title="Rechazar oferta"
          id="decline-offer"
          onClick={() =>
            removeOF({
              id_user: data.user_id,
              id_product: data.product_id,
              notification: true,
              from: cookies.get("id"),
            })
          }
        >
          <i className="fas fa-times-circle"></i>
        </button>
      </div>
      {data.activatePayment && (
        <PayuForm
          title="DIFERENCIA DEL PAGO"
          amount={
            data.advancePayment
              ? valueCounterOffer
                ? Math.round(valueCounterOffer - data.productValue)
                : Math.round(data.offerInNumber - data.productValue)
              : valueCounterOffer
              ? valueCounterOffer
              : data.offerInNumber
          }
          userInformation={data.userInformation}
          productTitle={data.productTitle}
          paymentHandler={setPaymentHandler}
          setAmountValue={setValueCounterOffer}
          payment={
            data.advancePayment
              ? { card: true, pse: false, bank: false, cash: false }
              : { card: true, pse: true, bank: true, cash: true }
          }
          setActivatePayment={data.setActivatePayment}
        />
      )}
      {activeCounterOffer && (
        <FloatingData
          title="Envíe una contraoferta"
          description="Selecciona el monto que le gustaría tener para llegar a un acuerdo"
          cancel="true"
          placeholder="Monto"
          thousandsSystem="true"
          setActive={setActiveCounterOffer}
          sendCallback={sendCounteroffer}
        />
      )}
    </div>
  );
}

export default OfferCard;
