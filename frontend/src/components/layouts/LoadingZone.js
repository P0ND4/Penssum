import { Fragment } from 'react';
import Loading from '../parts/Loading';

function LoadingZone ({ children, auth, products }){ 
    return products !== null && auth !== null ? <Fragment>{children}</Fragment> : <Loading center={true}/>; 
};

export default LoadingZone;