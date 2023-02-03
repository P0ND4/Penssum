import { useSelector, useDispatch } from "react-redux";
import { changeEvent } from "../../../features/product/activitySlice";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function PayForPenssum() {
  const { payForPenssum } = useSelector((state) => state.activity);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();

  return (
    payForPenssum && (
      <form
        className="payForPenssum-container"
        onSubmit={e => {
          e.preventDefault();
          dispatch(changeEvent({ payForPenssum: false }));
          cookies.set("pay-for-penssum", true, {
            path: "/post/activity",
            expires: new Date(Date.now() + 432000000),
          });
        }}
      >
        <div className="payForPenssum">
          <h1>! HOLA QUERID@ {user.firstName} !</h1>
          <h3>PAGA A TRAVÉS DE PENSSUM</h3>
          <p>
            La ventaja de realizar el pago de tus necesidades académicas a
            través de PENSSUM.
          </p>
          <ul>
            <li>
              <i className="fa fa-check"></i> Serán realizadas en el tiempo
              solicitado
            </li>
            <li>
              <i className="fa fa-check"></i> Las actividades tendrán la calidad
              requerida
            </li>
            <li>
              <i className="fa fa-check"></i> Una explicación muy detallada
            </li>
            <li>
              <i className="fa fa-check"></i> Tendrá la confianza de los
              profesores de penssum
            </li>
            <li>
              <i className="fa fa-check"></i> Tu dinero estará seguro
            </li>
          </ul>
          <p>
            Una vez cumplida tus expectativas será desembolsado el dinero al
            profesor.
          </p>
          <div className="payForPenssum-button-container">
            <button>!Gracias!</button>
          </div>
        </div>
      </form>
    )
  );
}

export default PayForPenssum;
