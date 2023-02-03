import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  removeOffer,
  makeCounteroffer,
  socket,
  acceptOffer,
} from "../../api";
import { thousandsSystem } from "../../helpers";
import swal from "sweetalert";
import PayuForm from "../PayuForm";
import FloatingData from "../FloatingData";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function OfferCard(data) {
  const user = useSelector(state => state.user);

  const [paymentHandler, setPaymentHandler] = useState(false);
  const [activeCounterOffer, setActiveCounterOffer] = useState(false);
  const [valueCounterOffer, setValueCounterOffer] = useState(null);

  const navigate = useNavigate();

  const dataAccept = useCallback(async () => {
    const result = await acceptOffer({
      from: cookies.get("id"),
      id_user: data.user_id,
      id_product: data.product_id,
      pay: paymentHandler,
      value: data.value
    });

    let newArrayOfOffers = [];

    data.offers.forEach((offer, index) => {
      if (index !== data.index) newArrayOfOffers.push(offer);
      if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
    });

    if (data.value !== 0 && !result.product.advancePayment) {
      socket.emit(
        "send_message",
        cookies.get("id"),
        data.user_id,
        `
                    Hola, soy el dueño del servicio ${
                      data.productTitle
                    }, me parece bien la oferta propuesta de ${
          data.value === 0 ? "Gratis" : `$${thousandsSystem(data.value)}`
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
    data.setActivatePayment(false);

    socket.emit("received event", data.user_id);
    socket.emit("offer event", {
      userID: data.user_id,
      post_id: data.product_id,
    });

    navigate(`/post/information/${data.product_id}`);
  }, [data, paymentHandler, navigate]);

  const sendCounterValue = useCallback(
    async (value) => {
      await makeCounteroffer({
        from: cookies.get("id"),
        to: data.user_id,
        value: value,
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

  const accept = async () => {
    swal({
      title: "¿Estás seguro?",
      text: `Una vez aceptada la oferta, este profesor tomará la publicación por un precio de ${data.value !== 0 ? `$${thousandsSystem(data.value)}` : "GRATIS"}`,
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        if (
          data.productValue < data.value &&
          (data.advancePayment ||
            data.paymentType === "bank" ||
            data.paymentType === "PSE" ||
            data.paymentType === "cash")
        )
          pay();
        else dataAccept();
      };
    });
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
          {data.value !== 0 ? `$${thousandsSystem(data.value)}` : "GRATIS"}
        </h3>
      </div>
      <div className="post-control-options">
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
                : Math.round(data.value - data.productValue)
              : valueCounterOffer
              ? valueCounterOffer
              : data.value
          }
          userInformation={user}
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
          thousandsSystem={true}
          maxLength={20}
          setActive={setActiveCounterOffer}
          sendCallback={sendCounteroffer}
        />
      )}
    </div>
  );
}

export default OfferCard;