import { useState } from "react";

function FloatingData({
  title,
  description,
  cancel,
  placeholder,
  setActive,
  sendCallback,
}) {
  const [data, setData] = useState("");
  const [value, setValue] = useState(0);

  return (
    <div
      className="floating-data-container"
      onClick={(e) =>
        e.target.classList.contains("floating-data-container") &&
        setActive(false)
      }
    >
      <div className="floating-data">
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="form-control">
          <input
            type="text"
            placeholder={placeholder}
            maxLength={20}
            onChange={(e) => {
              var num = e.target.value.replace(/\./g, "");
              if (!isNaN(num)) {
                setValue(parseInt(e.target.value.replace(/\./g, "")));
                num = num
                  .toString()
                  .split("")
                  .reverse()
                  .join("")
                  .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                num = num.split("").reverse().join("").replace(/^[.]/, "");
                setData(num);
              } else setData(e.target.value.replace(/[^\d.]*/g, ""));
            }}
            value={data}
          />
        </div>
        <div className="floating-data-buttons-container">
          {cancel && (
            <button id="cancel-data-floating" onClick={() => setActive(false)}>
              Cancelar
            </button>
          )}
          <button
            style={{
              background:
                !/^[0-9]{0,20}$/.test(value) || value === 0 ? "#3282B8" : "",
              opacity: !/^[0-9]{0,20}$/.test(value) || value === 0 ? ".4" : "",
              cursor:
                !/^[0-9]{0,20}$/.test(value) || value === 0
                  ? "not-allowed"
                  : "",
            }}
            id="send-data-floating"
            onClick={() => {
              if (/^[0-9]{0,20}$/.test(value) && value !== 0) {
                sendCallback(value);
                setActive(false);
              }
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingData;
