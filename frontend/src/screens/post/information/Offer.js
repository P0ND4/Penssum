import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { change } from "../../../features/product/informationSlice";
import { verificationOfInformation, thousandsSystem } from "../../../helpers";
import { makeOffer, socket } from "../../../api";
import swal from "sweetalert";

function Offer() {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const suspended = useSelector((state) => state.suspended);
  const {
    offerVerification,
    productFound,
    offerPrice,
    sendingInformation,
    offerValue,
  } = useSelector((state) => state.postInformation);

  const { post_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkAuth = () => {
    swal({
      title: "No estás registrado",
      text: "Para hacer uso de este evento necesita tener una cuenta como PROFESOR ¿quieres crear una cuenta?",
      icon: "info",
      buttons: ["No", "Si"],
    }).then((res) => res && navigate("/signup"));
  };

  const createOffer = async () => {
    document.querySelector(".field-make-offer").classList.remove("showError");
    document
      .querySelector(".field-make-offer-no-input")
      .classList.remove("showError");

    if (offerPrice === "")
      return document
        .querySelector(".field-make-offer-no-input")
        .classList.add("showError");

    if (/^[0-9]{0,20}$/.test(offerValue)) {
      const data = {
        mainInformation: {
          product: post_id,
          user: user._id,
          value: offerValue,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        notification: productFound.owner,
      };

      dispatch(change({ sendingInformation: true }));
      const result = await makeOffer(data);
      dispatch(change({ sendingInformation: false }));

      if (result.error) {
        swal({
          title: "Error",
          text: "Hubo un error al hacer la petición, inténtelo otra vez",
          icon: "error",
          timer: "3000",
          button: false,
        });
      } else {
        socket.emit("new offer", { userID: productFound.owner, post_id });
        swal({
          title: "Enviado",
          text: "Ha sido enviado satisfactoriamente la oferta",
          icon: "success",
          timer: "3000",
          button: false,
        });

        dispatch(change({ offerVerification: result }));
        dispatch(change({ offerPrice: "" }));
        dispatch(change({ offerValue: 0 }));
      }
    } else
      document.querySelector(".field-make-offer").classList.add("showError");

    socket.emit("received event", productFound.owner);
  };

  return (
    (user.objetive === "Profesor" || !auth) &&
    (offerVerification === null &&
    productFound.takenBy === null &&
    productFound.owner !== user._id &&
    productFound.stateActivated ? (
      !suspended ? (
        <section className="post-send-offer-container">
          <p>¿No estas de acuerdo con el precio?</p>
          <div className="post-send-container">
            <input
              type="text"
              value={offerPrice}
              placeholder="Has una oferta"
              id="make-offer"
              onChange={(e) => {
                document
                  .querySelector(".field-make-offer")
                  .classList.remove("showError");
                document
                  .querySelector(".field-make-offer-no-input")
                  .classList.remove("showError");
                var num = e.target.value.replace(/\./g, "");
                if (!isNaN(num)) {
                  dispatch(
                    change({
                      offerValue: parseInt(e.target.value.replace(/\./g, "")),
                    })
                  );
                  num = num
                    .toString()
                    .split("")
                    .reverse()
                    .join("")
                    .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                  num = num.split("").reverse().join("").replace(/^[.]/, "");
                  dispatch(change({ offerPrice: num }));
                } else
                  dispatch(
                    change({
                      offerPrice: e.target.value.replace(/[^\d.]*/g, ""),
                    })
                  );
              }}
            />
            <button
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
              onClick={() => {
                if (!sendingInformation)
                  auth
                    ? verificationOfInformation(user.objetive, user)
                      ? createOffer()
                      : navigate("/complete/information")
                    : checkAuth();
              }}
            >
              Enviar
            </button>
          </div>
        </section>
      ) : (
        <p className="youAreSuspended">
          Estás suspendido, no puedes hacer una oferta
        </p>
      )
    ) : (
      auth &&
      productFound.owner !== user._id &&
      productFound.takenBy === null &&
      user.objetive !== "Alumno" && (
        <p
          className="field"
          style={{
            display: "block",
            color: "#3282B8",
            fontSize: "22px",
            margin: "20px auto",
            textAlign: "center",
          }}
        >
          {offerVerification.isBought && offerVerification.isThePayment
            ? `Compraste este servicio por $${thousandsSystem(
                offerVerification.value
              )}`
            : !offerVerification.counterOffer
            ? `Su oferta ${
                offerVerification.value !== 0
                  ? `de $${thousandsSystem(offerVerification.value)}`
                  : "GRATIS"
              } ${
                offerVerification.acceptOffer
                  ? `ha sido aceptada`
                  : "Está en revisión"
              }`
            : ""}
        </p>
      )
    ))
  );
}

export default Offer;
