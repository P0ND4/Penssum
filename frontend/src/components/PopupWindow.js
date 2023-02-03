import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AccountConfirmationCard from '../components/AccountConfirmationCard'; // Pending if the account is not confirmed
import Vote from '../components/Vote'; // If there are a pending vote

function PopupWindow() {
  const auth = useSelector(state => state.auth);
  const vote = useSelector((state) => state.vote);
  const handlerVote = useSelector((state) => state.handlerVote);
  const pending = useSelector((state) => state.pending);

  return (
    <>
      {auth && pending && (
        <Link
          className="complete-information-card-container"
          to="/complete/information"
        >
          Completar Información
        </Link>
      )}
      <AccountConfirmationCard />
      {vote.length > 0 && handlerVote && <Vote pending={true} />}
    </>
  )
}

export default PopupWindow;