import { Link } from "react-router-dom";
import swal from 'sweetalert';
import { deleteUser } from '../../api';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function AccountConfirmationCard({ registration, userInformation, setRegistration, setUserInformation }) {
    const deleteConfirmation = () => {
        swal({
            title:'¿Estas seguro?',
            text: 'Al cancelar la confirmacion, el usuario quedara eliminado.',
            icon: 'warning',
            buttons: ['Rechazar','Aceptar']
        }).then(async res => {
            if(res) {
                await deleteUser(userInformation._id);
                cookies.remove('id');
                setRegistration(false);
                setUserInformation({});
            };
        });
    };

    return (
        (registration)
            ?   <div className="Account-Confirmation">
                    <Link className="Account-Confirmation_link" to={(userInformation.objetive === '') ? '/signup/selection' : '/signup/check/email'}>{
                        (userInformation.objetive === '')
                            ? `Por favor complete el registro de ${userInformation.username}`
                            : `Confirma tu cuenta como ${userInformation.username}`}
                    </Link>
                    <button onClick={() => deleteConfirmation()}>X</button>
                </div>
            : <></>
    );
};

export default AccountConfirmationCard;