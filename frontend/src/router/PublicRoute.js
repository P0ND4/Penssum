import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const auth = useSelector(state => state.auth);
  return !auth ? children : <Navigate to="/"/>
};

export default PublicRoute;