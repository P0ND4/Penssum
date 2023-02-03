import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { thousandsSystem } from "../../../helpers";
import {
  changeEvent,
  changeData,
} from "../../../features/product/activitySlice";
import swal from "sweetalert";

function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const files = useSelector((state) => state.files);
  const user = useSelector((state) => state.user);
  const {
    sendingInformation,
    coupon,
    data,
    subjectsSelected,
    price,
    value,
    error,
  } = useSelector((state) => state.activity);

  const [letter, setLetter] = useState(0);

  const dispatch = useDispatch();

  const validateSubject = () => {
    if (subjectsSelected.length === 0) {
      swal({
        title: "Materias",
        text: "¿Estás seguro de que quieres continuar sin seleccionar las materias a la que pertenece tu publicación? No aseguramos la pronta respuesta a tu necesidad académica.",
        icon: "info",
        buttons: ["No", "Si"],
      }).then(
        (res) => res && dispatch(changeEvent({ activateInformation: true }))
      );
    } else dispatch(changeEvent({ activateInformation: true }));
  };

  const createActivity = async () => {
    if (files !== null && files.length > 0) {
      if (
        (data.advancePayment && value > 0 && value) ||
        (coupon !== null && value > coupon.amount)
      ) {
        if (value >= 20000 && value <= 750000) validateSubject();
        else {
          swal({
            title: "OOPS",
            text: "Él montó mínimo que se puede transferir vía PENSSUM es de 20.000 COP hasta un máximo de 750.000 COP.",
            icon: "info",
            button: "Gracias",
          });
        }
      } else validateSubject();
    } else dispatch(changeEvent({ error: "Suba al menos una imagen." }));
  };

  return (
    <form
      onSubmit={handleSubmit(() => {
        if (!sendingInformation) createActivity();
      })}
    >
      {coupon && (
        <div className="coupon-applied-container">
          <div className="coupon-applied">
            <img src="/img/penssum-transparent.png" alt="penssum-icon" />
            <p>{coupon.name}</p>
          </div>
          <p>Cupón agregado correctamente</p>
          <p>
            Cupón de:{" "}
            <span>
              $
              {coupon.amount >= 1000
                ? thousandsSystem(coupon.amount)
                : coupon.amount}
            </span>
          </p>
        </div>
      )}
      <div className="form-control form-control-select">
        <select
          id="main-post-category"
          defaultValue=""
          {...register("category", {
            required: true,
            onChange: (e) => dispatch(changeData({ category: e.target.value })),
          })}
        >
          <option value="" hidden>
            CATEGORÍA
          </option>
          {user.objetive === "Alumno" && (
            <option value="Virtual">VIRTUAL...</option>
          )}
          {user.objetive === "Alumno" && (
            <option value="Presencial">PRESENCIAL...</option>
          )}
          {user.objetive === "Alumno" && <option value="Ambos">AMBOS</option>}
        </select>
        {errors.category?.type && (
          <p className="field" style={{ display: "block" }}>
            Elija una categoría
          </p>
        )}
      </div>
      <div className="form-control form-control-select">
        <select
          id="main-post-subcategory"
          defaultValue=""
          {...register("subCategory", {
            required: true,
            onChange: (e) =>
              dispatch(changeData({ subCategory: e.target.value })),
          })}
        >
          <option value="" hidden>
            SUBCATEGORÍA
          </option>
          <option value="Facultad ingenieria">FACULTAD INGENIERÍA</option>
          <option value="Otros">OTRO</option>
        </select>
        {errors.subCategory?.type && (
          <p className="field" style={{ display: "block" }}>
            Elija una subcategoría
          </p>
        )}
        <input
          type="button"
          id="button-blue"
          style={{ textAlign: "left" }}
          value={
            subjectsSelected.length > 0
              ? `Materias seleccionadas (${subjectsSelected.length})`
              : "Seleccionar materias"
          }
          onClick={() => dispatch(changeEvent({ isSubjectsOpen: true }))}
        />
      </div>
      <div className="form-control">
        <input
          type="text"
          placeholder="ASIGNATURA (Calculo Diferencial)"
          value={data.customCategory}
          {...register("customCategory", {
            required: true,
            pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
            onChange: (e) =>
              dispatch(changeData({ customCategory: e.target.value })),
          })}
        />
        {errors.customCategory?.type && (
          <p className="field" style={{ display: "block" }}>
            El nombre no puede superar los 30 ni tener menos de 3 caracteres,
            tener números o contener símbolos extraños.
          </p>
        )}
      </div>
      <div className="form-control">
        <input
          type="text"
          value={data.title}
          placeholder="TEMA (Derivadas)"
          {...register("title", {
            required: true,
            pattern: /^[a-zA-ZA-ÿ\u00f1\u00d1\s!:,.;]{3,30}$/,
            onChange: (e) => dispatch(changeData({ title: e.target.value })),
          })}
        />
        {errors.title?.type && (
          <p className="field" style={{ display: "block" }}>
            El tema no puede superar los 30 ni tener menos de 3 caracteres,
            tener números o contener símbolos extraño
          </p>
        )}
      </div>
      <div className="form-control">
        <div className="post-description-abbreviation">
          <textarea
            placeholder="Necesito urgentemente a alguien me explique o me resuelva las integrales."
            maxLength="120"
            value={data.description}
            {...register("description", {
              required: true,
              pattern: /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{30,120}$/,
              onChange: (e) => {
                dispatch(changeData({ description: e.target.value }));
                setLetter(e.target.value.length);
              },
            })}
          />
          <span id="letter-counter">{letter}/120</span>
        </div>
        {errors.description?.type && (
          <p className="field" style={{ display: "block" }}>
            La descripción no puede superar los 120 caracteres o tener menos de
            30 ni números o caracteres extraños.
          </p>
        )}
      </div>
      <div className="form-control">
        <input
          type="text"
          value={price}
          id="post-product-price"
          placeholder="Introduzca el valor del producto en pesos Colombianos (COP)"
          {...register("value", {
            required: true,
            pattern: /^[0-9.]{0,20}$/,
            onChange: (e) => {
              var num = e.target.value.replace(/\./g, "");

              if (!isNaN(num)) {
                if (
                  (!coupon || (coupon && parseInt(num) >= coupon.amount)) &&
                  num.length <= 10
                ) {
                  dispatch(
                    changeEvent({
                      value: parseInt(e.target.value.replace(/\./g, "")),
                    })
                  );
                  num = num
                    .toString()
                    .split("")
                    .reverse()
                    .join("")
                    .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                  num = num.split("").reverse().join("").replace(/^[.]/, "");
                  dispatch(changeEvent({ price: num }));
                }
              } else
                dispatch(
                  changeEvent({ price: e.target.value.replace(/[^\d.]*/g, "") })
                );

              changeEvent(e);
            },
          })}
        />
        {errors.value?.type && (
          <p className="field">
            El valor no puede contener letras ni superar los 20 dígitos.
          </p>
        )}
      </div>
      {user.objetive === "Alumno" && value > 0 && !coupon && (
        <div className="advancePayment-option-container">
          <div className="advancePayment-option">
            <span>¿Quieres pagar a través de PENSSUM?</span>
            <p>Compra Protegida tendrás el respaldo y la garantía.</p>
          </div>
          <span
            className="integrate-advancePayment-button"
            onClick={() =>
              dispatch(changeData({ advancePayment: !data.advancePayment }))
            }
            style={{
              boxShadow: !data.advancePayment ? "" : "#3282B8 0px 7px 29px 0px",
            }}
          >
            <div
              style={{
                transform: !data.advancePayment
                  ? "translateX(0)"
                  : "translateX(33px)",
                background: !data.advancePayment ? "#283841" : "#3282B8",
              }}
            >
              {!data.advancePayment ? "No" : "Si"}
            </div>
          </span>
        </div>
      )}
      <div className="post-product-data">
        <div className="dateOfDelivery">
          <label>Ingrese la fecha de entrega: </label>
          <input
            type="date"
            min="2023-01-01"
            max="2025-01-01"
            value={data.dateOfDelivery}
            {...register("dateOfDelivery", {
              onChange: (e) =>
                dispatch(changeData({ dateOfDelivery: e.target.value })),
            })}
          />
        </div>
      </div>
      {error.length > 0 && (
        <p
          className="field"
          style={{
            textAlign: "center",
            background: "#d10b0b",
            padding: "6px",
            borderRadius: "8px",
            color: "#FFFFFF",
            margin: "2px 0",
            display: "block",
          }}
        >
          {error}
        </p>
      )}
      <div className="form-control">
        <div className="post-button-container">
          <Link id="goToProfile" to={`/${user.username}`}>
            Ir al perfil
          </Link>
          <button
            id="publish"
            style={{
              background: sendingInformation ? "#3282B8" : "",
              opacity: sendingInformation ? ".4" : "",
              cursor: sendingInformation ? "not-allowed" : "",
            }}
          >
            Publicar
          </button>
        </div>
      </div>
    </form>
  );
}

export default Form;
