import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { sendQuote, socket, getProducts } from "../../api";
import {
  deleteFiles,
  uploadFiles,
  verificationOfInformation,
} from "../../helpers";
import swal from "sweetalert";
import Cookies from "universal-cookie";

// Slice redux
import {
  clean as cleanFiles,
  upload,
} from "../../features/function/filesSlice";
import { change, clean as cleanQuote } from "../../features/product/quoteSlice";

const cookies = new Cookies();

function Quote() {
  const user = useSelector((state) => state.user);
  const files = useSelector((state) => state.files);
  const suspended = useSelector((state) => state.suspended);
  const quote = useSelector((state) => state.quote);

  const [sendingInformation, setSendingInformation] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const uploadFilesTaken = async (filesTaken) => {
    if (filesTaken.length > 0) {
      const errorHandler = document.querySelector(".publish_error_handler");
      errorHandler.classList.remove("showError");
      errorHandler.textContent = "";

      setSendingInformation(true);
      const result = await uploadFiles(filesTaken, 6, files);
      if (result.success) dispatch(upload(result.successfulFiles));
      setSendingInformation(false);

      if (result.error) {
        if (result.type === "Exceeds the number of files allowed") {
          errorHandler.textContent = "Solo se acepta un máximo de 6 archivos.";
          errorHandler.classList.add("showError");
        } else if (
          result.type ===
          "some files were not uploaded becuase they break file rules"
        ) {
          errorHandler.innerHTML = `
                        Algunos archivos no fueron subidos. 
                        Verifique: <br/> 1) El tamaño no puede superar los 5MB <br/>
                                     2) Suba imágenes o documentos, nada más.
                    `;
          errorHandler.classList.add("showError");
        }
      }
    }
  };

  const remove = async (currentFile) => {
    const errorHandler = document.querySelector(".publish_error_handler");
    errorHandler.classList.remove("showError");

    const result = await deleteFiles(currentFile, files);
    dispatch(upload(result));
  };

  const handlerQuote = async () => {
    const errorHandler = document.querySelector(".publish_error_handler");
    errorHandler.classList.remove("showError");
    errorHandler.textContent = "";

    if (quote !== "") {
      if (quote.length === 24) {
        if (files !== null) {
          setSendingInformation(true);
          const result = await sendQuote(
            cookies.get("id"),
            quote.trim(),
            files
          );
          setSendingInformation(false);
          document.getElementById("sereal-id").value = "";

          if (result.error) {
            if (result.type === "the product not exists") {
              swal({
                title: "OOPS",
                text: "La publicación no existe :(",
                icon: "error",
                button: true,
              });
            }

            if (result.type === "you cannot send a quote to a blocked user") {
              swal({
                title: "Error",
                text:
                  result.data[0].from === cookies.get("id")
                    ? "No puedes enviar una actividad a un usuario que has bloqueado."
                    : "No puedes enviar una actividad a un usuario que te ha bloqueado.",
                icon: "error",
                button: true,
              });
            }

            if (result.type === "you cannot send a activity to yourself") {
              swal({
                title: "Error",
                text: "No puedes enviar una actividad a ti mismo.",
                icon: "error",
                button: true,
              });
            }

            if (
              result.type ===
              "you cannot send a activity that does not belong to you"
            ) {
              swal({
                title: "LO SENTIMOS :(",
                text: "No puedes enviar una actividad que no hayas tomado.",
                icon: "info",
                button: true,
              });
            }
          } else {
            const product = await getProducts({ id: quote });
            socket.emit("product updated", { userID: product.owner, product });
            socket.emit("received event", null, quote);
            swal({
              title: "Enviado",
              text: "La actividad ha sido enviada, espere la respuesta del dueño.",
              icon: "success",
              timer: "3000",
              button: false,
            }).then(() => navigate(`/post/information/${quote}`));
            dispatch(cleanFiles());
          }
          dispatch(cleanQuote());
          return;
        }
        errorHandler.textContent =
          "Selecciones, archivos o documentos a enviar.";
        errorHandler.classList.add("showError");
        return;
      }
      errorHandler.textContent = "Identificación de producto inválida.";
      errorHandler.classList.add("showError");
      return;
    }

    errorHandler.textContent =
      "Copie y pegue él, id del servicio para continuar.";
    errorHandler.classList.add("showError");
    return;
  };

  return user.objetive === "Profesor" &&
    verificationOfInformation(user.objetive, user) ? (
    !suspended ? (
      <div className="quote-container">
        <div className="quote">
          <div className="quote-form">
            <div className="quote-information-container">
              <img src="/img/illustration/files-sent.svg" alt="send-file" />
              <p>Envía el documento de la actividad.</p>
            </div>
            <p
              className="field publish_error_handler"
              style={{
                textAlign: "center",
                background: "#d10b0b",
                padding: "6px",
                borderRadius: "8px",
                color: "#FFFFFF",
                margin: "10px 0",
              }}
            ></p>
            <div className="uploaded-photo-container">
              {files.map((file) => (
                <div key={file.uniqueId}>
                  <span
                    className="clearFile"
                    onClick={() => remove({ fileName: file.fileName })}
                  >
                    x
                  </span>
                  <a href={file.url} rel="noreferrer" target="_blank">
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
                </div>
              ))}
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-control ">
                <div className="quote-file-zone">
                  <label
                    htmlFor={sendingInformation ? "" : "quote-file"}
                    style={{
                      background: sendingInformation ? "#3282B8" : "",
                      opacity: sendingInformation ? ".4" : "",
                      cursor: sendingInformation ? "not-allowed" : "",
                    }}
                  >
                    Seleccione las Imágenes/Archivos
                  </label>
                  <input
                    type="file"
                    id="quote-file"
                    multiple
                    hidden
                    onChange={(e) => uploadFilesTaken(e.target.files)}
                  />
                </div>
              </div>
              <div className="quote-section">
                <div className="form-control">
                  <input
                    id="sereal-id"
                    type="text"
                    placeholder="Escriba el ID de la publicación"
                    value={quote}
                    onChange={(e) => dispatch(change(e.target.value))}
                  />
                </div>
                <div className="form-control">
                  <button
                    id="send-quote"
                    style={{
                      background: sendingInformation ? "#3282B8" : "",
                      opacity: sendingInformation ? ".4" : "",
                      cursor: sendingInformation ? "not-allowed" : "",
                    }}
                    onClick={() => {
                      if (!sendingInformation) handlerQuote();
                    }}
                  >
                    Enviar Actividad
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : (
      <Navigate to={`/${user.username}`} />
    )
  ) : !verificationOfInformation(user.objetive, user) ? (
    <Navigate to="/complete/information" />
  ) : (
    <Navigate to="/signin" />
  );
}

export default Quote;
