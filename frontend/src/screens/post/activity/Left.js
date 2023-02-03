import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadFiles, deleteFiles } from "../../../helpers";
import { upload } from "../../../features/function/filesSlice";
import { changeEvent } from "../../../features/product/activitySlice";

function Left() {
  const { sendingInformation } = useSelector((state) => state.activity);
  const files = useSelector((state) => state.files);

  const [errorContent, setErrorContent] = useState("");

  const dispatch = useDispatch();

  const uploadFilesTaken = async (filesTaken) => {
    if (filesTaken.length > 0) {
      dispatch(changeEvent({ error: "" }));
      setErrorContent("");
      dispatch(changeEvent({ sendingInformation: true }));
      const result = await uploadFiles(filesTaken, 10, files);
      if (result.success) dispatch(upload(result.successfulFiles));
      dispatch(changeEvent({ sendingInformation: false }));

      if (result.error) {
        if (result.type === "Exceeds the number of files allowed") {
          setErrorContent("Solo se acepta un máximo de 10 archivos.");
        } else if (
          result.type ===
          "some files were not uploaded becuase they break file rules"
        ) {
          setErrorContent(
            `Algunos archivos no fueron compatibles en peso o formato.`
          );
        }
      }
    }
  };

  const remove = async (currentFile) => {
    setErrorContent("");
    const result = await deleteFiles(currentFile, files);
    dispatch(upload(result));
  };

  return (
    <section className="post-photos-container">
      <div className="container-to-upload-photos">
        {errorContent.length > 0 && (
          <p
            className="field"
            id="publish_error_handler-file"
            style={{
              textAlign: "justify",
              background: "#d10b0b",
              padding: "6px",
              borderRadius: "8px",
              color: "#FFFFFF",
              margin: "2px 0",
              display: "block",
            }}
          >
            {errorContent}
          </p>
        )}
        <label
          htmlFor={!sendingInformation ? "search-image" : ""}
          style={{
            background: sendingInformation ? "#3282B8" : "",
            opacity: sendingInformation ? ".4" : "",
            cursor: sendingInformation ? "not-allowed" : "",
          }}
        >
          Seleccionar Imágenes
        </label>
        {/*<p className="post-subtitle">O Suelta las imagenes aqui</p>*/}
        <input
          type="file"
          id="search-image"
          name="files"
          multiple
          hidden
          onChange={(e) => {
            if (!sendingInformation) uploadFilesTaken(e.target.files);
          }}
        />
      </div>
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
    </section>
  );
}

export default Left;
