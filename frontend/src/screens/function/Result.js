import { useSelector } from "react-redux";
import { changeDate } from "../../helpers";

function Result({ information, post_id }) {
  const user = useSelector(state => state.user);

  return (
    <div className="transactionReceipt">
      <div className="transactionReceipt-table">
        <h2>RESULTADO DE LA TRANSACCIÓN.</h2>
        <div className="information-transactionReceipt">
          <div>
            <p>ID del usuario</p>
            <p>{user._id}</p>
          </div>
          <div>
            <p>{post_id.length > 50 ? "TOKEN" : "ID de la publicacion"}</p>
            <p>
              {post_id.length > 50 ? `${post_id.slice(0, 20)}...` : post_id}
            </p>
          </div>
          <div>
            <p>Fecha de la compra</p>
            <p>{changeDate(Date())}</p>
          </div>
          <div>
            <p>Estado de la compra</p>
            <p>{information.message}</p>
          </div>
          <div>
            <p>Referencia del pedido</p>
            <p>{information.referenceCode}</p>
          </div>
          <div>
            <p>Referencia de transacción</p>
            <p>{information.transactionId}</p>
          </div>
          <div>
            <p>Número de transacción / CUS</p>
            <p>{information.cus}</p>
          </div>
          <div>
            <p>Banco</p>
            <p>{information.pseBank}</p>
          </div>
          <div>
            <p>Valor</p>
            <p>{information.TX_VALUE}$</p>
          </div>
          <div>
            <p>Valor del IVA</p>
            <p>{information.TX_TAX}$</p>
          </div>
          <div>
            <p>Valor total</p>
            <p>
              {parseInt(information.TX_VALUE) + parseInt(information.TX_TAX)}$
            </p>
          </div>
          <div>
            <p>Moneda</p>
            <p>{information.currency}</p>
          </div>
          <div>
            <p>Descripción</p>
            <p>{information.description}</p>
          </div>
          <div>
            <p>Correo</p>
            <p>{information.buyerEmail}</p>
          </div>
          <div>
            <p>{information.pseReference2}</p>
            <p>{information.pseReference3}</p>
          </div>
          <div>
            <p>Plataforma</p>
            <p>PENSSUM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
