import { useSelector } from "react-redux";
import PaymentCard from "../../components/dashboard/PaymentCard";

function Payments() {
  const transactions = useSelector(state => state.transactions);

  return (
    <div className="commomStylePadding">
      <h2 className="dashboard-payments-title">PAGOS PENDIENTES</h2>
      <div className="dashboard-payments-card-container">
        <div className="payment-card-dashboard-container">
          {transactions !== null && transactions.length > 0 ? (
            transactions.map((transaction) => {
              return (
                <div key={transaction._id}>
                  <PaymentCard
                    id={transaction._id}
                    productTitle={transaction.productTitle}
                    username={transaction.username}
                    method={transaction.method}
                    advance={transaction.advance}
                    amount={transaction.amount}
                    bank={transaction.bank}
                    accountNumber={transaction.accountNumber}
                    accountType={transaction.accountType}
                    userId={transaction.userId}
                    ownerId={transaction.ownerId}
                    productId={transaction.productId}
                    orderId={transaction.orderId}
                    transactionId={transaction.transactionId}
                    operationDate={transaction.operationDate}
                    paymentType={transaction.paymentType}
                    paymentNetwork={transaction.paymentNetwork}
                    verification={transaction.verification}
                    description={transaction.description}
                    files={transaction.files}
                  />
                </div>
              );
            })
          ) : (
            <h2 className="thereAreNoPayments">NO HAY PAGOS PENDIENTES</h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;
