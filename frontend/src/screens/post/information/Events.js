import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CounterOffer from "./CounterOffer";
import Offer from "./Offer";

function Events() {
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const {
    productFound,
    task,
    teacher,
    teacherUsername,
    sentReportTransaction,
  } = useSelector((state) => state.postInformation);

  return (
    <>
      {auth &&
        productFound.stateActivated &&
        productFound.takenBy !== null &&
        task !== false &&
        (productFound.takenBy === user._id ||
          user._id === productFound.owner) && (
          <div className="activity-pictures-post-information-container">
            <h1>Actividad enviada</h1>
            <div className="activity-pictures-post-information">
              {task.files.map((file) => (
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
          </div>
        )}
      {productFound.takenBy !== null && teacher !== null && (
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
          Publicación tomada por un profesor{" "}
          <Link style={{ color: "#3282B8" }} to={`/${teacherUsername}`}>
            {teacher.firstName
              ? teacher.firstName
              : teacher.secondName
              ? teacher.firstName
              : teacherUsername}
          </Link>
        </p>
      )}
      <CounterOffer />
      <Offer />
      {productFound.owner === user._id &&
        (productFound.paymentType === "cash" ||
          productFound.paymentType === "bank") &&
        !productFound.advancePayment &&
        !sentReportTransaction && (
          <p className="verificationOfPaymentSent">
            Comprobante de pago enviado, espera a que los moderadores revisen su
            reporte de transacción.
          </p>
        )}
      <p className="field field-make-offer-no-input">Escriba un valor.</p>
      <p className="field field-make-offer">
        La oferta no debe tener más de 10 caracteres.
      </p>
    </>
  );
}

export default Events;