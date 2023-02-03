import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { change } from "../../../features/product/informationSlice";
import { acceptOffer, removeOffer, socket } from "../../../api";
import { thousandsSystem } from "../../../helpers";
import swal from "sweetalert";

function CounterOffer() {
  const user = useSelector((state) => state.user);
  const { offerVerification, sendingInformation, productFound } = useSelector(
    (state) => state.postInformation
  );

  const { post_id } = useParams();
  const dispatch = useDispatch();

  const acceptCounterOffer = () => {
    swal({
      title: "¿Quieres aceptar la contraoferta?",
      text: "Si aceptas la contraoferta podrás obtener la publicación por el precio que acordaron",
      icon: "info",
      buttons: ["No", "Si"],
    }).then(async (res) => {
      if (res) {
        dispatch(change({ sendingInformation: true }));
        const result = await acceptOffer({
          id_user: user._id,
          id_product: post_id,
        });
        dispatch(change({ offerVerification: result.offer }));
        dispatch(change({ sendingInformation: false }));

        if (!productFound.advancePayment) {
          socket.emit(
            "send_message",
            productFound.owner,
            user._id,
            `
            Hola, soy el dueño del servicio ${
              productFound.title
            }, me parece bien la oferta propuesta de ${
              offerVerification.value === 0
                ? "Gratis"
                : `$${thousandsSystem(offerVerification.value)}`
            } me gustaría llegar a un acuerdo con usted de cómo se haría realidad la implementación del servicio propuesto.
                    `
          );
        }

        swal({
          title: "ÉXITO",
          text: "!Has aceptado la oferta satisfactoriamente!",
          icon: "success",
          button: true,
        });
      }
    });
  };

  const removeCounterOffer = () => {
    swal({
      title: "¿Estás seguro?",
      text: "¿No quieres aceptar la contraoferta?",
      icon: "warning",
      buttons: ["Espera", "Correcto"],
    }).then(async (res) => {
      if (res) {
        dispatch(change({ sendingInformation: true }));
        await removeOffer({
          id_user: user._id,
          id_product: post_id,
          notification: false,
          from: user._id,
        });
        dispatch(change({ offerVerification: null }));
        dispatch(change({ sendingInformation: false }));

        swal({
          title: "!ÉXITO!",
          text: `La contraoferta ha sido cancelada`,
          icon: "success",
          timer: "3000",
          button: false,
        });
      }
    });
  };

  return (
    offerVerification !== null &&
    offerVerification.counterOffer && (
      <div className="counter-offer-container">
        <p>El estudiante de la publicación ha creado una contraoferta.</p>
        <div className="counter-offer-button-container">
          <button
            id="accept-counter-offer"
            title="Aceptar contraoferta"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) acceptCounterOffer();
            }}
          >
            {offerVerification.value === 0
              ? "GRATIS"
              : `$${thousandsSystem(offerVerification.value)}`}
          </button>
          <button
            id="remove-counter-offer"
            title="Negar contraoferta"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) removeCounterOffer();
            }}
          >
            X
          </button>
        </div>
      </div>
    )
  );
}

export default CounterOffer;