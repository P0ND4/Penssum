import { useSelector } from "react-redux";
import { Fragment } from "react";
import Loading from "../components/Loading";

function LoadingZone({ children }) {
  const auth = useSelector((state) => state.auth);
  const products = useSelector((state) => state.products);

  return products !== null && auth !== null ? (
    <Fragment>{children}</Fragment>
  ) : (
    <Loading center={true}/>
  );
}

export default LoadingZone;