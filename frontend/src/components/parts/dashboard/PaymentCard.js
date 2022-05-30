import { useState, useEffect } from 'react';
import { removeTransaction } from '../../../api';

import swal from 'sweetalert';

import { changeDate } from '../../helpers/';

function PaymentCard (data) {
	const [activeInformation,setActiveInformation] = useState(false);
	const [width,setWidth] = useState(window.innerWidth);

    const changeWidth = () => setWidth(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', changeWidth);
        return (() => window.removeEventListener('resize', changeWidth));
    });


	const remove = async () => {
		swal({
            title: '¿Ya finalizaste la transaccion?',
            text: 'Recuerda que debes cumplir con los clientes, primero has la transaccion, luego puedes quitarlo, si el usuario no ha colocado la informacion necesaria puedes esperar a que lo coloque.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
        	if (res) {
        		await removeTransaction({ id: data.id, id_user: data.ownerId, amount: data.amount });

        		const currentTransactions = [];

        		data.transactions.forEach(transaction => (transaction._id !== data.id) && currentTransactions.push(transaction));

        		data.setTransaction(currentTransactions);

        		swal({
        			title: 'Exito',
        			text: 'Transaccion finalizada con exito',
        			icon: 'success',
        			button: false,
        			timer: '3000'
        		});
        	};                 
		});
	};

	return (
		<div className="payment-card-dashboard">
          	<div className="icon-exclamation-container">
          		<i className="fa-solid fa-circle-exclamation icon-exclamation" 
	          	   title="Mas informacion"
	          	   onClick={() => setActiveInformation(!activeInformation)}>
	          	</i>
	          	{activeInformation && (
	          		<div className="payment-card-dashboard-information">
	          			{width <= 600 && <i className="fas fa-chevron-left" id="fa-chevron-left-payment-dashboard" onClick={() => setActiveInformation(!activeInformation)}></i>}
	          			<p>ID del usuario: {data.userId}</p>                                                                                     
	          			<p>ID del dueño: {data.ownerId}</p>                                                                                    
	          			<p>ID del producto: {data.productId}</p>                                                                                 
	          			<p>orderId: {data.orderId}</p>                                                                                                        
	          			<p>ID de transaccion: {data.transactionId}</p>                                                                               
						<p>Fecha de operacion: {changeDate(data.operationDate)}</p>          
	          			<p>Tipo de pago: {data.paymentType}</p>                                                                            
	          			<p>Red de pago: {data.paymentNetwork}</p>
	          			<p>Monto: {data.amount} COP</p>
			          	<p>Banco: {data.bank}</p>
			          	<p>Tipo: {data.accountType}</p>
			          	<p>Cuenta: {data.accountNumber}</p>
	          		</div>
	          	)}
          	</div>
          	<p>Monto: {data.amount} COP</p>
          	{(width > 750 || (width > 500 && width <= 600)) && <p>Banco: {data.bank}</p>}
          	{width > 850 && <p>Tipo: {data.accountType}</p>}
          	{width > 1100 && <p>Cuenta: {data.accountNumber}</p>}
          	<div className="payment-card-dashboard-button-container">
          	    <button onClick={() => remove()}>Listo</button>
          	</div>
      	</div>
	);
};

export default PaymentCard;