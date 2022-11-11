import { useState, useEffect } from "react";
import { fileEvent } from "../helpers";
import swal from "sweetalert";
import {
  getUser,
  sendReport,
  blockUser,
  getProducts,
  reviewBlocked,
  removeFiles,
  getNotifications,
  getTransaction,
  sendTransactionVerification,
} from "../../api";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function Report({
  setReportUsername,
  reportUsername,
  obtainedFiles,
  setObtainedFiles,
  setProducts,
  setNotifications,
  setCountInNotification,
  reportProductId,
  setReportProductId,
  reportTransaction,
  setReportTransaction,
}) {
  const [reportDescription, setReportDescription] = useState("");
  const [sendingInformation, setSendingInformation] = useState(false);
  const [amount, setAmount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (reportTransaction) {
      const checkTransaction = async () => {
        const result = await getTransaction({
          checkVerification: cookies.get("id"),
          post_id: reportTransaction,
        });
        if (!result.error) {
          setReportTransaction(false);
          setReportProductId(null);
        }
      };
      checkTransaction();
    }
  }, [reportTransaction, setReportTransaction, setReportProductId]);

  const uploadFiles = async (files) => {
    if (files.length > 0) {
      const errorReport = document.querySelector(".field-error-report");
      errorReport.classList.remove("showError");
      errorReport.textContent = "";

      setSendingInformation(true);
      const result = await fileEvent.uploadFiles(
        files,
        5,
        obtainedFiles,
        setObtainedFiles
      );
      setSendingInformation(false);

      if (result.error) {
        if (result.type === "Exceeds the number of files allowed") {
          errorReport.textContent = "Solo se acepta un máximo de 5 archivos.";
          errorReport.classList.add("showError");
        } else if (
          result.type ===
          "some files were not uploaded becuase they break file rules"
        ) {
          errorReport.textContent = `Algunos archivos no fueron subidos por formato inválido o peso inválido máximo 5MB.`;
          errorReport.classList.add("showError");
        }
      }
    }
  };

  const remove = async (currentFile) => {
    const errorReport = document.querySelector(".field-error-report");
    errorReport.classList.remove("showError");
    errorReport.textContent = "";
    await fileEvent.remove(currentFile, obtainedFiles, setObtainedFiles);
  };

  const validateReport = async () => {
    const errorReport = document.querySelector(".field-error-report");
    errorReport.classList.remove("showError");
    errorReport.textContent = "";

    if (
      reportDescription.length >= 50 &&
      reportDescription.length <= 1000 &&
      reportUsername.length >= 3 &&
      reportUsername.length <= 30
    ) {
      if (reportTransaction) {
        if (/^[0-9]{1,20}$/.test(amount)) {
          setSendingInformation(true);
          await sendTransactionVerification({
            userID: cookies.get("id"),
            post_id: reportProductId,
            amount,
            files: obtainedFiles,
          });
          setSendingInformation(false);
          swal({
            title: "!Éxito!",
            text: "Se ha completado el envío de la verificación de transacción.",
            icon: "success",
            timer: "3000",
            button: false,
          }).then(() => navigate(`/post/information/${reportProductId}`));
        } else {
          errorReport.textContent = "Elige un monto válido.";
          errorReport.classList.add("showError");
        }
      } else {
        setSendingInformation(true);
        const user = await getUser({ username: reportUsername });

        if (!user.error) {
          const result = await reviewBlocked({
            from: cookies.get("id"),
            to: user._id,
          });

          if (result.length > 0) {
            swal({
              title: "Error",
              text: "No puedes enviar un reporte a un usuario bloqueado.",
              icon: "error",
              timer: "3000",
              button: false,
            });

            setReportUsername("");
            setReportDescription("");
            await removeFiles({ files: obtainedFiles });
          } else {
            swal({
              title: "¿Quieres bloquear al usuario?",
              text: "Si bloqueas al usuario no podrá enviarte mensajes o ver tus publicaciones, al igual que tú. Solo lo puedes desbloquear entrando de nuevo a su perfil y presionando el botón de desbloqueo.",
              icon: "info",
              closeOnClickOutside: false,
              closeOnEsc: false,
              buttons: {
                cancel: {
                  text: "Rechazar",
                  value: false,
                  visible: true,
                },
                confirm: {
                  text: "Aceptar",
                  value: true,
                },
              },
            }).then(async (res) => {
              if (res) {
                await blockUser({ from: cookies.get("id"), to: user._id });
                await sendReport({
                  from: cookies.get("id"),
                  userToReport: reportUsername,
                  description: reportDescription,
                  files: obtainedFiles,
                  post_id: setReportProductId,
                });

                const products = await getProducts({
                  blockSearch: cookies.get("id"),
                });
                setProducts(products);

                const briefNotifications = await getNotifications(
                  cookies.get("id")
                );

                const currentNotification = [];
                let count = 0;

                for (let i = 0; i < 3; i++) {
                  if (briefNotifications[i] !== undefined)
                    currentNotification.push(briefNotifications[i]);
                }
                for (let i = 0; i < briefNotifications.length; i++) {
                  if (!briefNotifications[i].view) count += 1;
                }

                setCountInNotification(count);
                setNotifications(currentNotification);
              } else {
                await sendReport({
                  from: cookies.get("id"),
                  userToReport: reportUsername,
                  description: reportDescription,
                  files: obtainedFiles,
                });
              }
              swal({
                title: "!Éxito!",
                text: "Se ha completado el reporte.",
                icon: "success",
                timer: "3000",
                button: false,
              }).then(() => navigate("/"));
            });
          }
          setObtainedFiles(null);
          setSendingInformation(false);
        } else {
          swal({
            title: "Error",
            text: "El usuario no existe.",
            icon: "error",
            timer: "3000",
            button: false,
          });
        }
      }
    } else {
      if (reportUsername.length === 0)
        errorReport.textContent = reportTransaction
          ? "Escriba el ID de referencia."
          : "Escriba el nombre de usuario.";
      else if (reportUsername.length < 3 || reportUsername.length > 30)
        errorReport.textContent = reportTransaction
          ? "Escriba un ID de transacción válida"
          : "Escriba un nombre de usuario válido.";
      else if (reportDescription.length < 50)
        errorReport.textContent = "De una descripción más detallada.";
      else errorReport.textContent = "Hay un máximo de 1000 caracteres.";

      errorReport.classList.add("showError");
    }
  };

  return (
    <div className="report-container">
      <div className="report">
        <h1 className="report-title">
          {reportTransaction ? "Comprobar transacción" : "Reporta usuario"}
        </h1>
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          <p
            className="field field-error-report"
            style={{
              textAlign: "center",
              background: "#d10b0b",
              padding: "6px",
              borderRadius: "8px",
              color: "#FFFFFF",
            }}
          ></p>
          <div className="form-control">
            <input
              type="text"
              placeholder={
                reportTransaction
                  ? "Escriba el ID de referencia"
                  : "Escribe el username del usuario"
              }
              value={reportUsername}
              onChange={(e) => setReportUsername(e.target.value)}
            />
          </div>
          {reportProductId && (
            <div className="form-control">
              <p className="report-product-id">
                ID/Serial del producto: {reportProductId}
              </p>
            </div>
          )}
          {reportTransaction && (
            <div className="form-control">
              <input
                type="number"
                maxLength={20}
                placeholder="Escriba el monto transferido"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}
          <div className="form-control" style={{ position: "relative" }}>
            <textarea
              placeholder={
                reportTransaction
                  ? "Describa la transacción por este medio para su posterior comprobación"
                  : "Describe porque lo quiere reportar"
              }
              id="report-description"
              maxLength="1000"
              value={reportDescription}
              onChange={(e) => {
                setReportDescription(e.target.value);
                document.getElementById(
                  "letter-count-report-description"
                ).textContent = `${e.target.value.length}/1000`;
              }}
            ></textarea>
            <span id="letter-count-report-description">0/1000</span>
          </div>
          <div className="form-control">
            <div className="test-image-container">
              <label
                htmlFor={!sendingInformation ? "test-image" : ""}
                style={{
                  background: sendingInformation ? "#3282B8" : "",
                  opacity: sendingInformation ? ".4" : "",
                  cursor: sendingInformation ? "not-allowed" : "",
                }}
              >
                Seleccione las imagenes de prueba
              </label>
              <p>
                Esto es importante para validar{" "}
                {reportTransaction ? "la transacción" : "el reporte"}
              </p>
            </div>
            <input
              type="file"
              id="test-image"
              multiple
              hidden
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </div>
          <div className="selected-report-images-container">
            {obtainedFiles !== null &&
              obtainedFiles.map((file) => (
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
          <div className="form-control">
            <button
              id="send-user-report"
              style={{
                background: sendingInformation ? "#3282B8" : "",
                opacity: sendingInformation ? ".4" : "",
                cursor: sendingInformation ? "not-allowed" : "",
              }}
              onClick={() => {
                if (!sendingInformation) validateReport();
              }}
            >
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Report;
