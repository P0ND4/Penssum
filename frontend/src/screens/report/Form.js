import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change as changeUser } from "../../features/user/reportSlice";
import { upload } from "../../features/function/filesSlice";
import { deleteFiles, uploadFiles } from "../../helpers";

function Form({
  error,
  errorContent,
  register,
  errors,
  setError,
  setErrorContent,
  setSendingInformation,
  sendingInformation,
}) {
  const user = useSelector((state) => state.user);
  const files = useSelector((state) => state.files);
  const reportUser = useSelector((state) => state.reportUser);
  const reportProduct = useSelector((state) => state.reportProduct);
  const transaction = useSelector((state) => state.transaction);
  const [letter, setLetter] = useState(0);

  const dispatch = useDispatch();

  const uploadFilesTaken = async (filesTaken) => {
    if (filesTaken.length > 0) {
      setError(false);
      setErrorContent("");

      setSendingInformation(true);
      const result = await uploadFiles(filesTaken, 5, files);
      if (result.success) dispatch(upload(result.successfulFiles));
      setSendingInformation(false);

      if (result.error) {
        if (result.type === "Exceeds the number of files allowed") {
          setErrorContent("Solo se acepta un máximo de 5 archivos.");
          setError(true);
        } else if (
          result.type ===
          "some files were not uploaded becuase they break file rules"
        ) {
          setErrorContent(
            `Algunos archivos no fueron subidos por formato inválido o peso inválido máximo 5MB.`
          );
          setError(true);
        }
      }
    }
  };

  const remove = async (currentFile) => {
    setError(false);
    setErrorContent("");
    const result = await deleteFiles(currentFile, files);
    dispatch(upload(result));
  };

  return (
    <>
      {error && (
        <p
          className="field"
          style={{
            textAlign: "center",
            background: "#d10b0b",
            padding: "6px",
            borderRadius: "8px",
            color: "#FFFFFF",
            display: "block",
          }}
        >
          {errorContent}
        </p>
      )}
      <div className="form-control">
        <input
          type="text"
          placeholder={
            transaction
              ? "Escriba el ID de referencia"
              : "Escribe el username del usuario"
          }
          value={reportUser}
          {...register("report", {
            required: true,
            pattern: /^[a-zA-Z0-9_.-]{3,30}$/,
            validate: (report) => report.toLowerCase() !== user.stringToCompare,
            onChange: (e) => dispatch(changeUser(e.target.value)),
          })}
        />
        {(errors.report?.type === "required" ||
          errors.report?.type === "pattern") && (
          <p className="field" style={{ display: "block" }}>
            El reporte no debe tener menos de 3 caracteres o tener mas de 30
          </p>
        )}
        {errors.report?.type === "validate" && (
          <p className="field" style={{ display: "block" }}>
            El reporte no debe tener tu nombre de usuario
          </p>
        )}
      </div>
      {reportProduct && (
        <div className="form-control">
          <p className="report-product-id">
            ID/Serial del producto: {reportProduct}
          </p>
        </div>
      )}
      {transaction && (
        <div className="form-control">
          <input
            type="number"
            maxLength={20}
            placeholder="Escriba el monto transferido"
            {...register("amount", {
              required: true,
              pattern: /^[0-9]{1,20}$/,
            })}
          />
        </div>
      )}
      {errors.amount?.type && (
        <p className="field" style={{ display: "block" }}>
          El monto solo debe contener número, y no debe quedar nulo
        </p>
      )}
      <div className="form-control" style={{ position: "relative" }}>
        <textarea
          placeholder={
            transaction
              ? "Describa la transacción por este medio para su posterior comprobación"
              : "Describe porque lo quiere reportar"
          }
          id="report-description"
          maxLength="1000"
          {...register("description", {
            required: true,
            pattern: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{50,1000}$/,
            onChange: (e) => {
              setLetter(e.target.value.length);
            },
          })}
        />
        <span id="letter-count-report-description">{letter}/1000</span>
      </div>
      {errors.description?.type && (
        <p className="field" style={{ display: "block" }}>
          La descripción no puede tener menos de 50 caracteres ni tener mas de
          1000 caracteres
        </p>
      )}
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
            {transaction ? "la transacción" : "el reporte"}
          </p>
        </div>
        <input
          type="file"
          id="test-image"
          multiple
          hidden
          onChange={(e) => uploadFilesTaken(e.target.files)}
        />
      </div>
      <div className="selected-report-images-container">
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
      <div className="form-control">
        <button
          id="send-user-report"
          style={{
            background: sendingInformation ? "#3282B8" : "",
            opacity: sendingInformation ? ".4" : "",
            cursor: sendingInformation ? "not-allowed" : "",
          }}
        >
          Aceptar
        </button>
      </div>
    </>
  );
}

export default Form;
