import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { accountAuthentication } from '../../../api';
import CardSelection from "../../parts/CardSelection";
import Cookies from 'universal-cookie';
import Loading from '../../parts/Loading';

const cookies = new Cookies();

function Selection({ userInformation, setUserInformation, setAuth, setRegistrationProcess, registrationProcess, setRegistration }) {
    const navigate = useNavigate();

    useEffect(() => setRegistration(false));

    const sendUserSelection = async (objetive) => {
        const result = await accountAuthentication({
            objetive: objetive,
            validated: (userInformation.registered === 'local') ? false : true,
            email: userInformation.email,
            id: userInformation._id
        });

        setRegistrationProcess({
            validated: result.validated,
            selection: true
        });

        setUserInformation(result);

        if (result.validated) {
            cookies.set('id', result._id, { path: '/' });
            setAuth(true);
            navigate(`/${userInformation.username}`);
        } else { navigate('/signup/check/email') };
    };

    return (
        <div>
            {registrationProcess.selection === null
                ? <div style={{ padding: '40px' }}><Loading margin='auto' /></div>
                : !registrationProcess.selection ? (
                    <div className="selection-container">
                        <div className="selection">
                            <h1 className="selection-title">SELECCIONE EL TIPO DE USUARIO</h1>
                            <div className="card-selection-container">
                                <CardSelection title="Estudiante" description="Busque a personas que enseñen lo que necesite." src="/img/illustration/client.svg" alt="Alumno" sendUserSelection={sendUserSelection} />
                                <CardSelection title="Profesor" description="Publique sus servicios como profesor." src="/img/illustration/supplier.svg" alt="Profesor" sendUserSelection={sendUserSelection} />
                            </div>
                        </div>
                    </div>
                ) : <Navigate to="/"/>}
        </div>
    );
};

export default Selection;