import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  teacherPayment,
  socket,
  vote,
  getProducts,
  removeFiles,
  deleteProduct,
} from "../../../api";
import { thousandsSystem } from "../../../helpers";
import { change } from "../../../features/product/informationSlice";
import { save } from "../../../features/product/productsSlice";
import swal from "sweetalert";

function Value() {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const {
    offerVerification,
    offerTeacher,
    productFound,
    task,
    sendingInformation,
    currentVote,
    teacher,
    teacherUsername,
    score,
    handlerVote,
  } = useSelector((state) => state.postInformation);

  const { post_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const finalize = useCallback(async () => {
    if (!currentVote) {
      await vote({
        from: user._id,
        to:
          user._id === productFound.owner
            ? productFound.takenBy
            : productFound.owner,
        productId: productFound._id,
        vote: score,
      });
    }

    const currentProductsCollections = await getProducts({
      blockSearch: user._id,
    });
    dispatch(save(currentProductsCollections));

    if (user._id === productFound.owner) {
      socket.emit("product deleted", {
        userID: productFound.takenBy,
        finished: true,
      });
      dispatch(change({ sendingInformation: true }));
      await teacherPayment({
        typeData: "accept",
        post_id,
        user_id: productFound.owner,
      });
      await removeFiles({ files: productFound.files, activate: true });
      await deleteProduct({ id: post_id, notification: false, finished: true });
      socket.emit("received event", productFound.takenBy);
      dispatch(change({ sendingInformation: false }));
      swal({
        title: "! FELICIDADES !",
        text: "Has mandado el pago al profesor satisfactoriamente, la publicación ha finalizado exitosamente.",
        icon: "success",
        timer: "4000",
        button: false,
      }).then(() => navigate("/"));
    } else {
      dispatch(change({ sendingInformation: true }));
      await removeFiles({ files: productFound.files, activate: true });
      await deleteProduct({
        id: post_id,
        notification: false,
        finished: true,
        teacher: true,
      });
      socket.emit("received event", productFound.owner);
      dispatch(change({ sendingInformation: false }));
      swal({
        title: "FINALIZADO",
        text: "La publicación ha sido finalizada correctamente.",
        icon: "success",
        timer: "2000",
        button: false,
      }).then(() => navigate("/"));
    }
  }, [user, navigate, post_id, productFound, score, dispatch, currentVote]);

  useEffect(() => {
    if (handlerVote) finalize();
  }, [handlerVote, finalize]);

  const finalizedPublicaction = () => {
    swal({
      title: "¿YA TE PAGARON?",
      text: "Si ya te pagaron puedes finalizar la publicación y darlo por hecho, si no te han pagado y estás sufriendo de estafa, por favor repórtelo, si está en espera no de por finalizado la publicación.",
      icon: "info",
      buttons: ["Cancelar", "Si"],
    }).then(async (res) => {
      if (res) {
        if (!currentVote) dispatch(change({ activeVote: true }));
        else finalize();
      }
    });
  };

  const doNotSendPayment = (why) => {
    swal({
      title: "ATENCIÓN",
      text:
        user.objetive === "Alumno"
          ? "Antes de negar el pago, por favor explica por qué no quieres hacer la transacción, y que es lo que falta para que la transacción se realice."
          : "Antes de no aceptar la finalización de la publicación, por favor explica por qué no quieres, sé por favor respetuoso y trata como te gustaría que te trataran.",
      icon: "info",
      buttons: ["Cancelar", "Ok"],
    }).then((res) => {
      if (res) {
        swal({
          title: `ESCRIBE EL MENSAJE PARA ${
            user === "Alumno"
              ? teacher.firstName
                ? teacher.firstName
                : teacher.secondName
                ? teacher.secondName
                : teacherUsername
              : "EL ALUMNO"
          }`,
          content: {
            element: "input",
            attributes: {
              placeholder: "Mensaje",
              type: "text",
            },
          },
          button: "Enviar",
        }).then(async (value) => {
          if (value === null) return;

          if (value) {
            dispatch(change({ sendingInformation: true }));
            const result = await teacherPayment({
              typeData: "declined",
              post_id,
              user_id:
                user.objetive === "Alumno"
                  ? productFound.owner
                  : productFound.takenBy,
              why,
            });
            socket.emit(
              "send_message",
              user.objetive === "Alumno"
                ? productFound.owner
                : productFound.takenBy,
              user.objetive === "Alumno"
                ? productFound.takenBy
                : productFound.owner,
              value
            );
            socket.emit(
              "received event",
              user.objetive === "Alumno"
                ? productFound.takenBy
                : productFound.owner
            );
            socket.emit("product updated", {
              userID:
                user.objetive === "Alumno"
                  ? productFound.takenBy
                  : productFound.owner,
              post_id,
            });
            dispatch(change({ productFound: result }));
            dispatch(change({ sendingInformation: false }));
            swal({
              title: "Enviado",
              text: "Mensaje enviado con éxito",
              icon: "success",
              timer: "2000",
              button: false,
            });
          }
        });
      }
    });
  };

  const sendPayToTeacher = () => {
    swal({
      title: "¿Ya han terminado con la publicación?",
      text: "Si han terminado la publicación se eliminará de penssum y se enviará el pago al profesor por el servicio dado.",
      icon: "info",
      buttons: ["No hemos terminado", "Hemos terminado"],
    }).then(async (res) => {
      if (res) {
        if (!currentVote) dispatch(change({ activeVote: true }));
        else finalize();
      }
    });
  };

  return (
    <div className="value-information-container">
      <label>Valor del producto</label>
      <h1 className="post-producto-value">
        {offerVerification !== null && offerVerification.acceptOffer
          ? `$${thousandsSystem(offerVerification.value)}`
          : offerTeacher !== null && offerTeacher.acceptOffer
          ? `$${thousandsSystem(offerTeacher.value)}`
          : productFound.value === 0
          ? "Ayuda gratuita"
          : `$${thousandsSystem(productFound.value)}`}
      </h1>
      {auth &&
        productFound.stateActivated &&
        ((productFound.advancePayment && productFound.owner === user._id) ||
          (!productFound.advancePayment &&
            productFound.takenBy === user._id)) &&
        task !== false &&
        productFound.paymentRequest.active === true && (
          <div className="accordance-post-information-container">
            <h2>¿Estás conforme?</h2>
            <p>
              {user.objetive === "Alumno"
                ? "¿Quieres enviarle el pago al profesor?"
                : "¿Quieres dar por finalizado la publicación?"}
            </p>
            <div className="accordance-post-information">
              <button
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
                id="accordance-yes"
                onClick={() => {
                  if (!sendingInformation)
                    user.objetive === "Alumno"
                      ? sendPayToTeacher()
                      : finalizedPublicaction();
                }}
              >
                Si
              </button>
              <button
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
                id="accordance-lack"
                onClick={() => {
                  if (!sendingInformation)
                    doNotSendPayment("Falta de informacion");
                }}
              >
                Aun falta
              </button>
              <button
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
                id="accordance-no"
                onClick={() => {
                  if (!sendingInformation) doNotSendPayment("Rechazado");
                }}
              >
                No
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default Value;