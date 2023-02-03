import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createCoupon, removeCoupon, getCoupons } from "../../api";
import { thousandsSystem, changeDate } from "../../helpers";
import swal from "sweetalert";
import { change } from "../../features/dashboard/couponsSlice";

function Coupons() {
  const coupons = useSelector(state => state.coupons);

  const [sendingInformation, setSendingInformation] = useState(false);
  const [activeCreateCoupon, setActiveCreateCoupon] = useState(false); // ACOMODAR VENTANA FLOTANTE
  const [dataCoupons, setDataCoupons] = useState({ // NO ME CUADRA ESTA PARTE
    name: "",
    amount: "",
    utility: "",
    time: "",
    activeUtility: false,
    activeTime: false,
  });

  const dispatch = useDispatch();

  const makeCoupon = async () => {
    setSendingInformation(true);

    const data = {
      name: dataCoupons.name,
      amount: parseInt(dataCoupons.amount.replace(/\./g, "")),
      utility: parseInt(dataCoupons.utility.replace(/\./g, "")),
      time: dataCoupons.time,
    };

    const result = await createCoupon(data);

    if (!result.error) {
      const coupons = await getCoupons(); // NO REPETIR SI NO UTILIZAR UN USEREF
      dispatch(change(coupons));
      setActiveCreateCoupon(false);

      setDataCoupons({
        name: "",
        amount: "",
        utility: "",
        time: "",
        activeUtility: false,
        activeTime: false,
      });

      swal({
        title: "Creado",
        text: "Cupón creado correctamente.",
        icon: "success",
        timer: "2000",
        button: false,
      });
    } else {
      swal({
        title: "!OOPS!",
        text: "El cupón ya existe.",
        icon: "error",
        timer: "2000",
        button: false,
      });
    }

    setSendingInformation(false);
  };

  const deleteCoupon = (id) => {
    swal({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar el cupón?",
      icon: "warning",
      buttons: ["No", "Si"],
    }).then(async (res) => {
      if (res) {
        await removeCoupon({ id_coupon: id });
        const coupons = await getCoupons();
        dispatch(change(coupons));
      }
    });
  };

  return (
    <div className="commomStylePadding dashboard-coupons">
      <div className="coupon-title-container">
        <h2 className="coupon-title">
          CUPONES <i className="fa-solid fa-ticket"></i>
        </h2>
        <h1 className="coupon-subtitle">AYUDA A TUS USUARIOS</h1>
      </div>
      <div className="coupons-container">
        <div className="nav-coupons">
          <h2>
            {coupons.length === 0 ? "NO HAY CUPONES" : "CUPONES ACTUALES"}
          </h2>
          <button onClick={() => setActiveCreateCoupon(true)}>Crear</button>
        </div>
        {coupons.map((coupon) => (
          <div className="coupons" key={coupon.name}>
            <div className="cuopon">
              <p>
                Código: <span>{coupon.name}</span>
              </p>
              <p>
                Monto:{" "}
                <span>
                  $
                  {coupon.amount >= 1000
                    ? thousandsSystem(coupon.amount)
                    : coupon.amount}
                </span>
              </p>
              <p>
                Uso restante:{" "}
                <span>
                  {coupon.utility >= 1000
                    ? thousandsSystem(coupon.utility)
                    : coupon.utility
                    ? coupon.utility
                    : "Ilimitado"}
                </span>
              </p>
              <p>
                Expira:{" "}
                <span>
                  {coupon.time ? changeDate(coupon.time) : "No Expira"}
                </span>
              </p>
              <button title="Eliminar" onClick={() => deleteCoupon(coupon._id)}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      {activeCreateCoupon && (
        <div
          className="create-coupon-container"
          onClick={(e) =>
            e.target.className === "create-coupon-container" &&
            setActiveCreateCoupon(false)
          }
        >
          <div className="create-coupon">
            <h1>CREA UN CUPON</h1>
            <div className="create-coupon-body">
              <input
                className="create-coupon-name"
                type="text"
                placeholder="Nombre del cupon a utilizar"
                value={dataCoupons.name}
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    setDataCoupons({
                      ...dataCoupons,
                      name: e.target.value.trim(),
                    });
                  }
                }}
              />
              <input
                className="create-coupon-amount"
                type="text"
                placeholder="Dinero a abonar"
                value={dataCoupons.amount}
                onChange={(e) => {
                  if (
                    e.target.value.length < 14 &&
                    /^[0-9.]{0,20}$/.test(e.target.value)
                  ) {
                    var num = e.target.value.replace(/\./g, "");
                    if (!isNaN(num)) {
                      num = num
                        .toString()
                        .split("")
                        .reverse()
                        .join("")
                        .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                      num = num
                        .split("")
                        .reverse()
                        .join("")
                        .replace(/^[.]/, "");
                      setDataCoupons({ ...dataCoupons, amount: num });
                    } else setDataCoupons({ ...dataCoupons, amount: num });
                  }
                }}
              />
              <div className="divider-create-coupon">
                <div className="divider-create">
                  <p>¿Quieres agregar un límite de uso?</p>
                  <button
                    className="dashboard-selection-button"
                    onClick={() => {
                      setDataCoupons({
                        ...dataCoupons,
                        activeUtility: !dataCoupons.activeUtility,
                        utility: "",
                      });
                    }}
                  >
                    <div
                      style={{
                        transform: !dataCoupons.activeUtility
                          ? "translateX(0)"
                          : "translateX(33px)",
                        background: !dataCoupons.activeUtility
                          ? "#283841"
                          : "#3282B8",
                      }}
                    >
                      {!dataCoupons.activeUtility ? "No" : "Si"}
                    </div>
                  </button>
                </div>
                <input
                  disabled={!dataCoupons.activeUtility ? true : false}
                  type="text"
                  placeholder="Cuantas veces se va a utilizar el cupon"
                  value={dataCoupons.utility}
                  onChange={(e) => {
                    if (
                      e.target.value.length < 10 &&
                      /^[0-9.]{0,20}$/.test(e.target.value)
                    ) {
                      var num = e.target.value.replace(/\./g, "");
                      if (!isNaN(num)) {
                        num = num
                          .toString()
                          .split("")
                          .reverse()
                          .join("")
                          .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                        num = num
                          .split("")
                          .reverse()
                          .join("")
                          .replace(/^[.]/, "");
                        setDataCoupons({
                          ...dataCoupons,
                          utility: num,
                        });
                      } else
                        setDataCoupons({
                          ...dataCoupons,
                          utility: num,
                        });
                    }
                  }}
                  style={{
                    cursor: !dataCoupons.activeUtility ? "not-allowed" : "",
                    background: !dataCoupons.activeUtility ? "#CCCCCC" : "",
                  }}
                />
              </div>
              <div className="divider-create-coupon">
                <div className="divider-create">
                  <p>¿Quieres agregar una fecha de expedición?</p>
                  <button
                    className="dashboard-selection-button"
                    onClick={() =>
                      setDataCoupons({
                        ...dataCoupons,
                        activeTime: !dataCoupons.activeTime,
                        time: "",
                      })
                    }
                  >
                    <div
                      style={{
                        transform: !dataCoupons.activeTime
                          ? "translateX(0)"
                          : "translateX(33px)",
                        background: !dataCoupons.activeTime
                          ? "#283841"
                          : "#3282B8",
                      }}
                    >
                      {!dataCoupons.activeTime ? "No" : "Si"}
                    </div>
                  </button>
                </div>
                <input
                  onChange={(e) => {
                    setDataCoupons({
                      ...dataCoupons,
                      time: e.target.value,
                    });
                  }}
                  value={dataCoupons.time}
                  disabled={!dataCoupons.activeTime ? true : false}
                  type="date"
                  style={{
                    cursor: !dataCoupons.activeTime ? "not-allowed" : "",
                    background: !dataCoupons.activeTime ? "#CCCCCC" : "",
                  }}
                />
              </div>
              <div className="divider-create-coupon button-container-coupon">
                <button
                  style={{
                    background: sendingInformation ? "#3282B8" : "",
                    opacity: sendingInformation ? ".4" : "",
                    cursor: sendingInformation ? "not-allowed" : "",
                  }}
                  onClick={() => {
                    if (!sendingInformation) {
                      setActiveCreateCoupon(false);
                      setDataCoupons({
                        name: "",
                        amount: "",
                        utility: "",
                        time: "",
                        activeUtility: false,
                        activeTime: false,
                      });
                    }
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    dataCoupons.name &&
                    parseInt(dataCoupons.amount.replace(/\./g, "")) > 0 &&
                    dataCoupons.amount !== "" &&
                    !sendingInformation &&
                    makeCoupon()
                  }
                  style={{
                    background:
                      !dataCoupons.name ||
                      parseInt(dataCoupons.amount.replace(/\./g, "")) === 0 ||
                      dataCoupons.amount === "" ||
                      sendingInformation
                        ? "#3282B8"
                        : "",
                    opacity:
                      !dataCoupons.name ||
                      parseInt(dataCoupons.amount.replace(/\./g, "")) === 0 ||
                      dataCoupons.amount === "" ||
                      sendingInformation
                        ? ".4"
                        : "",
                    cursor:
                      !dataCoupons.name ||
                      parseInt(dataCoupons.amount.replace(/\./g, "")) === 0 ||
                      dataCoupons.amount === "" ||
                      sendingInformation
                        ? "not-allowed"
                        : "",
                  }}
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;
