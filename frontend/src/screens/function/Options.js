import { Link } from "react-router-dom";
import ReactToPrint from "react-to-print";

function Options({ transactionDocument, information }) {
  return (
    <div className="transactionReceipt-button-container">
      <Link to={`/`}>
        <button>
          <i className="fa fa-check"></i> Finalizar transacción
        </button>
      </Link>
      <ReactToPrint
        trigger={() => (
          <button>
            <i className="fas fa-print"></i> Imprimir comprobante
          </button>
        )}
        content={() => transactionDocument.current}
        documentTitle={`Documento de transacción PENSSUM ${information.pseReference3}`}
        pageStyle="print"
      />
    </div>
  );
}

export default Options;
