import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";

function Payment() {
  const user = useSelector(state => state.user);

  return user.objetive === "Profesor" ? (
    <Link to="/preference/payment_payu" style={{ textDecoration: "none" }}>
      <div className="commomStylePadding payment">
        <section className="payment-method-help-card">
          <img src="/img/payu.png" alt="payu" />
          <p>
            Es una pasarela de pagos con más de 18 años de experiencia en el
            mercado y se encargará de mediar las transacciones de los clientes
            de tu servicio y tu banco para poder recibir las ganancias.
          </p>
        </section>
      </div>
    </Link>
  ) : (
    <Navigate to="/preference/general" />
  );
}

export default Payment;
