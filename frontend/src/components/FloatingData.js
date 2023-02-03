import { useState } from "react";

function FloatingData({
  title,
  description,
  cancel,
  placeholder,
  setActive,
  sendCallback,
  thousandsSystem,
  maxLength = 100,
  minLength = 0,
  isNumber,
  spaces = true,
  regularExpressions,
  password,
  cancelEvent
}) {
  const [data, setData] = useState("");
  const [value, setValue] = useState(isNumber || thousandsSystem ? 0 : "");

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
            type={password ? "password" : "text"}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => {
              if (thousandsSystem) {
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
              } else if (isNumber) {
                setValue(
                  isNaN(parseInt(e.target.value))
                    ? ""
                    : parseInt(e.target.value)
                );
              } else {
                if (regularExpressions) {
                  if (regularExpressions.test(e.target.value))
                    setValue(spaces ? e.target.value : e.target.value.trim());
                } else
                  setValue(spaces ? e.target.value : e.target.value.trim());
              }
            }}
            value={thousandsSystem ? data : value}
          />
        </div>
        <div className="floating-data-buttons-container">
          {cancel && (
            <button
              id="cancel-data-floating"
              onClick={() => {
                if (cancelEvent) cancelEvent();
                setActive(false);
              }}
            >
              Cancelar
            </button>
          )}
          <button
            style={{
              background: thousandsSystem
                ? !/^[0-9]{0,20}$/.test(value) || value === 0
                  ? "#3282B8"
                  : ""
                : value.length < minLength || value.length > maxLength
                ? "#3282B8"
                : "",
              opacity: thousandsSystem
                ? !/^[0-9]{0,20}$/.test(value) || value === 0
                  ? ".4"
                  : ""
                : value.length < minLength || value.length > maxLength
                ? ".4"
                : "",
              cursor: thousandsSystem
                ? !/^[0-9]{0,20}$/.test(value) || value === 0
                  ? "not-allowed"
                  : ""
                : value.length < minLength || value.length > maxLength
                ? "not-allowed"
                : "",
            }}
            id="send-data-floating"
            onClick={() => {
              if (
                thousandsSystem &&
                /^[0-9]{0,20}$/.test(value) &&
                value !== 0
              ) {
                sendCallback(value);
                setActive(false);
                return;
              }

              if (
                !thousandsSystem &&
                value.length >= minLength &&
                value.length <= maxLength
              ) {
                sendCallback(value);
                setActive(false);
                return;
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
