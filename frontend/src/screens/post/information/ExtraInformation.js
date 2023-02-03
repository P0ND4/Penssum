import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { changeDate, verificationOfInformation } from "../../../helpers";
import {
  requestPayment,
  changeVideoCallURL,
  removeTakePost,
  getProducts,
  socket,
} from "../../../api";
import { active as activeTransaction } from "../../../features/function/transactionSlice";
import { change as changeProduct } from "../../../features/product/reportSlice";
import { change as changeInformation } from "../../../features/product/informationSlice";
import { change as changeQuote } from "../../../features/product/quoteSlice";
import { change as changeReport } from "../../../features/product/reportSlice";
import { save } from "../../../features/product/productsSlice";
import { CopyToClipboard } from "react-copy-to-clipboard";
import swal from "sweetalert";

function ExtraInformation() {
  const [urlVideoCall, setUrlVideoCall] = useState("");

  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const {
    productFound,
    sentReportTransaction,
    sendingInformation,
    offerVerification,
    task,
    teacherUsername,
    teacher,
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

  const removeTake = () => {
    swal({
      title:
        user._id === productFound.owner
          ? "¿Quieres expulsar al profesor?"
          : "¿Quieres renunciar?",
      text:
        user._id === productFound.owner
          ? `Recuerda que puedes sacar al profesor si no se comunica con usted, o por algún inconveniente que hayan tenido, no saques a profesores sin ningún motivo por que podría llevar a la suspensión de su cuenta.`
          : `Puedes renunciar a la publicación cuando quieras, pero por favor no lo hagas el mismo día de la entrega, porque podría llevar a la suspensión de su cuenta, y ser reportado a nuestro moderador.`,
      icon: "warning",
      buttons: ["Mejor no", "Estoy seguro"],
    }).then(async (res) => {
      if (res) {
        const teacher = productFound.takenBy;
        dispatch(changeInformation({ sendingInformation: true }));
        const result = await removeTakePost({
          post_id,
          typeOfUser: user._id === productFound.owner ? "students" : "teacher",
          user_id: user._id,
        });
        dispatch(changeInformation({ offerTeacher: null }));
        dispatch(changeInformation({ offerVerification: null }));
        dispatch(changeInformation({ sendingInformation: false }));

        if (result.error) {
          swal({
            title: "ERROR",
            text:
              user._id === productFound.owner
                ? "El profesor ya renuncio."
                : "El estudiante de la publicación ya te expulso.",
            icon: "error",
            button: "ok",
          });

          dispatch(changeInformation({ productFound: result.product }));
        } else {
          socket.emit(
            "received event",
            user._id === productFound.owner ? teacher : productFound.owner
          );
          socket.emit("product updated", {
            userID:
              user._id === productFound.owner ? teacher : productFound.owner,
            product: result,
            globalProductUpdate: true,
            remove: true,
          });
          socket.emit("product changed", {
            owner: productFound.owner,
            userID: productFound.owner === user._id ? teacher : user._id,
          });
          swal({
            title: "!EXITO!",
            text:
              user._id === productFound.owner
                ? `
                Has expulsado al profesor, tu publicación ha sido republicada.
                        `
                : `
                Has renunciado a la publicación satisfactoriamente.
                        `,
            icon: "success",
            button: "!Gracias!",
          });
          dispatch(changeInformation({ productFound: result }));
        }
        const newProductsCollection = await getProducts({
          blockSearch: user._id,
        });
        dispatch(save(newProductsCollection));
      }
    });
  };

  const requestPay = async () => {
    if (productFound.advancePayment) {
      dispatch(changeInformation({ sendingInformation: true }));
      const result = await requestPayment({
        post_id,
        teacher_id: productFound.takenBy,
      });
      dispatch(changeInformation({ sendingInformation: false }));
      socket.emit("received event", productFound.owner);
      socket.emit("product updated", { userID: productFound.owner, post_id });
      dispatch(changeInformation({ productFound: result }));
      swal({
        title: "!ÉXITO!",
        text: `Se ha enviado la petición de pago con éxito, recuerda que el estudiante tiene un máximo de 8 días para reportarse, de lo contrario debe entrar a la publicación para liberar el dinero, una vez finalizado el pago, estará pendiente por realizar, espere la respuesta del estudiante.`,
        icon: "success",
        button: "!Gracias!",
      });
    } else {
      swal({
        title: "ATENCIÓN",
        text: "Esta publicación no tiene verificado el pago por medio de PENSSUM, debes llegar a un acuerdo con el estudiante con respecto al pago.",
        icon: "info",
        button: "Ok",
      }).then(() => {
        swal({
          title: `ESCRIBE EL MENSAJE PARA ${
            teacher.firstName
              ? teacher.firstName
              : teacher.secondName
              ? teacher.secondName
              : teacherUsername
          }`,
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
            socket.emit(
              "send_message",
              productFound.takenBy,
              productFound.owner,
              value
            );
            socket.emit("received event", productFound.owner);
            swal({
              title: "Enviado",
              text: "Mensaje enviado con éxito",
              icon: "success",
              timer: "2000",
              button: false,
            }).then(() => navigate("/messages"));
          }
        });
      });
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
          timer: "2000",
          button: false,
        }).then(() => navigate("/messages"));
      }
    });
  };

  return (
    <div className="date-and-call-video-container">
      <h1 className="post-information-date">
        Fecha:{" "}
        {productFound.dateOfDelivery === null
          ? "Indefinido"
          : changeDate(productFound.dateOfDelivery)}
      </h1>
      {productFound.owner === user._id &&
        (productFound.paymentType === "cash" ||
          productFound.paymentType === "bank") &&
        !productFound.advancePayment &&
        sentReportTransaction && (
          <button
            className="post-information-check-payment"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) {
                dispatch(activeTransaction());
                dispatch(changeProduct(post_id));
                navigate("/report");
              }
            }}
          >
            Comprobar pago
          </button>
        )}

      {productFound.stateActivated &&
        productFound.owner !== user._id &&
        (offerVerification === null || offerVerification.acceptOffer) &&
        (user.objetive === "Profesor" || !auth) &&
        productFound.takenBy === null && (
          <button
            className="post-information-apply"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation)
                auth
                  ? verificationOfInformation(user.objetive, user)
                    ? dispatch(changeInformation({ activeInformation: true }))
                    : navigate("/complete/information")
                  : checkAuth();
            }}
          >
            Postularse
          </button>
        )}

      {productFound.stateActivated &&
        productFound.takenBy !== null &&
        (productFound.takenBy === user._id ||
          productFound.owner === user._id) && (
          <button
            className="post-information-apply"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation)
                sendMessage(
                  user._id,
                  productFound.owner === user._id
                    ? productFound.takenBy
                    : productFound.owner
                );
            }}
          >
            <i
              className="fas fa-envelope"
              style={{
                fontSize: 18,
                color: "#FFFFFF",
                marginRight: 4,
              }}
            ></i>{" "}
            Enviar mensaje
          </button>
        )}

      {auth &&
        productFound.stateActivated &&
        productFound.takenBy === user._id &&
        task !== false &&
        productFound.paymentRequest.active === false && (
          <button
            className="post-information-give-up"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) requestPay();
            }}
          >
            Solicitar pago
          </button>
        )}

      {auth &&
        productFound.stateActivated &&
        !productFound.advancePayment &&
        productFound.owner === user._id &&
        task !== false &&
        !productFound.advancePayment &&
        productFound.paymentRequest.active === false && (
          <button
            className="post-information-finished"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={async () => {
              dispatch(changeInformation({ sendingInformation: true }));
              const result = await requestPayment({
                post_id,
                teacher_id: productFound.owner,
              });
              dispatch(changeInformation({ sendingInformation: false }));
              socket.emit("received event", productFound.takenBy);
              socket.emit("product updated", {
                userID: productFound.takenBy,
                post_id,
              });
              dispatch(changeInformation({ productFound: result }));
              swal({
                title: "!ÉXITO!",
                text: `Se ha enviado la petición de finalización de la publicación, espere la respuesta del profesor.`,
                icon: "success",
                button: "!Gracias!",
              });
            }}
          >
            Finalizado
          </button>
        )}

      {auth &&
        productFound.stateActivated &&
        productFound.takenBy !== null &&
        (productFound.takenBy === user._id ||
          productFound.owner === user._id) && (
          <div className="post-information-remove-take-button-container">
            <i
              className="fa-solid fa-flag"
              id="report-teacher-post-information"
              title={
                productFound.takenBy !== user._id
                  ? "Reportar profesor"
                  : "Reportar alumno"
              }
              style={{
                width: task === false ? "" : "100%",
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
              onClick={() => {
                if (!sendingInformation) {
                  dispatch(
                    changeReport(
                      productFound.takenBy !== user._id
                        ? teacherUsername
                        : productFound.creatorUsername
                    )
                  );
                  dispatch(changeProduct(post_id));
                  navigate("/report");
                }
              }}
            ></i>
            {(task === false || productFound.takenBy === user._id) && (
              <button
                className="post-information-give-up"
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
                onClick={() => {
                  if (!sendingInformation) removeTake();
                }}
              >
                {productFound.takenBy === user._id
                  ? "Renunciar"
                  : "Expulsar profesor"}
              </button>
            )}
          </div>
        )}

      {auth &&
        productFound.stateActivated &&
        productFound.takenBy !== null &&
        productFound.takenBy === user._id && (
          <button
            className="post-information-activity"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
            onClick={() => {
              if (!sendingInformation) {
                dispatch(changeQuote(post_id));
                navigate("/send/quote");
              }
            }}
          >
            Enviar actividad
          </button>
        )}

      {productFound.owner === user._id && (
        <div className="add-video_call-link-container">
          <p>¿Quiere integrar una videollamada externa?</p>
          <div className="add-video_call-link">
            <input
              type="url"
              placeholder="Agrega el link de la videollamada"
              style={{ width: productFound.videoCall ? "" : "100%" }}
              value={urlVideoCall}
              onChange={(e) => setUrlVideoCall(e.target.value)}
            />
            <button
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
                borderRadius: productFound.videoCall ? "" : "8px",
              }}
              onClick={async () => {
                if (
                  !sendingInformation &&
                  /^(ftp|http|https):\/\/[^ "]+$/.test(urlVideoCall)
                ) {
                  const productUpdated = await changeVideoCallURL({
                    post_id,
                    url: urlVideoCall,
                  });
                  dispatch(changeInformation({ productFound: productUpdated }));
                  swal({
                    title: "!Cambiado con éxito!",
                    text: `La nueva URL es ${productUpdated.videoCall}.`,
                    icon: "success",
                    timer: "3000",
                    button: false,
                  });
                  socket.emit("product updated", {
                    userID: productFound.takenBy,
                    post_id,
                  });
                  setUrlVideoCall("");
                } else {
                  swal({
                    title: "!OOPS!",
                    text: `Necesita ingresar una URL válida.`,
                    icon: "info",
                    button: "Gracias",
                  });
                }
              }}
            >
              Guardar
            </button>
            {productFound.videoCall && (
              <button
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
                id="delete-url-videoCall"
                onClick={() => {
                  if (!sendingInformation) {
                    swal({
                      title: "¿Estás seguro?",
                      text: "¿Quieres eliminar el Link de la videollamada?.",
                      icon: "warning",
                      buttons: ["No", "Si"],
                    }).then(async (res) => {
                      if (res) {
                        const productUpdated = await changeVideoCallURL({
                          post_id,
                          remove: true,
                        });
                        dispatch(
                          changeInformation({ productFound: productUpdated })
                        );

                        swal({
                          title: "!ÉXITO!",
                          text: `La URL ha sido eliminado correctamente`,
                          icon: "success",
                          timer: "3000",
                          button: false,
                        });
                        socket.emit("product updated", {
                          userID: productFound.takenBy,
                          post_id,
                        });
                      }
                    });
                  }
                }}
              >
                Remover
              </button>
            )}
          </div>
        </div>
      )}
      {auth &&
        productFound.stateActivated &&
        ((offerVerification !== null &&
          offerVerification.acceptOffer &&
          offerVerification.isThePayment) ||
          productFound.owner === user._id ||
          productFound.takenBy === user._id) &&
        productFound.videoCall && (
          <div className="post-video_call-zone">
            <p className="post-call-video-link">Link de la videollamada:</p>
            <div className="post-video_call-link-container">
              <a
                href={productFound.videoCall}
                target="_BLANK"
                rel="noreferrer"
                className="post-video_call-link"
              >
                {productFound.videoCall.length > 20
                  ? productFound.videoCall.slice(0, 22) + "..."
                  : productFound.videoCall}
              </a>
              <div className="option-post-video_call">
                <CopyToClipboard
                  text={productFound.videoCall}
                  onCopy={() => dispatch(changeInformation({ copied: true }))}
                >
                  <i className="fa-solid fa-copy" title="Copiar"></i>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default ExtraInformation;