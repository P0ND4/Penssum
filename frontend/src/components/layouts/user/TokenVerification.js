import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tokenVerification, socket } from '../../../api';
import Loading from '../../parts/Loading';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function TokenVerification({ setAuth, setUserInformation, setRegistration }) {
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => setRegistration(false));

   useEffect(() => {
        const loadToken = async () => {
            const result = await tokenVerification(token);

            if (result.error) { navigate('/') } 
            else {
                cookies.set('id', result._id, { path: '/' });
                setUserInformation(result);
                setAuth(true);
                socket.emit('connected', result._id);
                navigate(`/${result.username}`);
            };
        };
        loadToken();
    },[navigate,setAuth,setUserInformation,token]);

    return (
        <div className="Token-Verification-Container">
            <Loading size={120} />
            <h1>PROCESANDO SOLICITUD</h1>
            <p>Este proceso puede durar unos minutos por favor espere.</p>
        </div>
    );
};

export default TokenVerification;