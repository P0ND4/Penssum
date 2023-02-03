import { useState, useEffect, useRef } from "react";
import { getRemainTime } from "../../../helpers";
import { useDispatch, useSelector } from "react-redux";
import { getCoupons } from "../../../api";
import { thousandsSystem } from "../../../helpers";
import swal from "sweetalert";
import {
  changeData,
  changeEvent,
} from "../../../features/product/activitySlice";

function Coupon() {
  const user = useSelector((state) => state.user);
  const { coupon } = useSelector((state) => state.activity);

  const [couponText, setCouponText] = useState("");
  const [errorCoupon, setErrorCoupon] = useState(0);
  const [incrementError, setIncrementError] = useState(15000);
  const [timerError, setTimerError] = useState(null);

  const dispatch = useDispatch();
  const timerErrorRef = useRef();

  const getCoupon = async () => {
    const coupon = await getCoupons({
      text: couponText,
      username: user.username,
    });

    if (coupon.error) {
      swal({
        title: "!OOPS!",
        text:
          coupon.type === "the coupon don`t exists"
            ? "No se encontró el cupón."
            : coupon.type === "coupon expired"
            ? "El cupón expiró."
            : "Ya usó el cupón",
        icon: "error",
        button: "Gracias",
      });
      if (coupon.type === "the coupon don`t exists")
        setErrorCoupon(errorCoupon + 1);
    } else {
      dispatch(changeEvent({ coupon }));
      setIncrementError(15000);
      setErrorCoupon(0);
      dispatch(changeEvent({ value: coupon.amount }));
      dispatch(
        changeEvent({
          price:
            coupon.amount >= 1000
              ? thousandsSystem(coupon.amount)
              : coupon.amount,
        })
      );
      dispatch(changeData({ advancePayment: false }));
      swal({
        title: "! EXCELENTE !",
        text: "Cupón agregado correctamente.",
        icon: "success",
        button: false,
        timer: "2000",
      });
    }
  };

  useEffect(() => {
    if (errorCoupon === 3 || timerError) {
      setErrorCoupon(0);
      if (!timerError) {
        const currentDate = new Date();
        const TimeInMilliseconds = currentDate.getTime();
        const newDate = new Date(TimeInMilliseconds + incrementError);

        setTimerError(getRemainTime(newDate));
        timerErrorRef.current = setInterval(
          () => setTimerError(getRemainTime(newDate)),
          1000
        );
        const newIncrement = incrementError * 2;
        setIncrementError(newIncrement);
      }

      if (timerError && timerError.remainTime <= 1) {
        clearInterval(timerErrorRef.current);
        setTimerError(null);
      }
    }
  }, [errorCoupon, timerError, incrementError]);

  return (
    !coupon && (
      <section className="coupon-zone-container">
        <p className="coupon-zone-title">¿Tienes un cupón?</p>
        <div className="coupon-zone-selection">
          <input
            type="text"
            value={couponText}
            onChange={(e) => setCouponText(e.target.value.trim())}
            placeholder="Ingresa el cupon aqui"
          />
          <button
            style={{
              background: timerError ? "#3282B8" : "",
              opacity: timerError ? ".4" : "",
              cursor: timerError ? "not-allowed" : "",
            }}
            onClick={() => couponText && !timerError && getCoupon()}
          >
            Validar
          </button>
        </div>
        {timerError && (
          <p className="coupon-zone-locked">
            Tiempo de bloqueo: {timerError.remainHours}:
            {timerError.remainMinutes}:{timerError.remainSeconds}
          </p>
        )}
      </section>
    )
  );
}

export default Coupon;
