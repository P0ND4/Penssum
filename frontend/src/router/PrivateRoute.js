import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const auth = useSelector(state => state.auth);
  return auth ? children : <Navigate to="/signin"/>
};

export default PrivateRoute;