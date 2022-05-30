import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '../../parts/Loading';
import ReactToPrint from 'react-to-print';
import { saveTransaction } from '../../../api';

import { changeDate } from '../../helpers/';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function TransactionReceipt ({ userInformation }){
	const [information,setInformation] = useState(null);

	const { post_id } = useParams();
	const  transactionDocument = useRef();

	useEffect(() => {
		const getData = window.location.search;
		const urlParams = new URLSearchParams(getData);
		const entries = urlParams.entries();

		let informationObtained = {};

		for (const value of entries) informationObtained = { ...informationObtained, [value[0]]: value[1] };

		if (Object.keys(informationObtained).length !== 0) setInformation(informationObtained);
	},[post_id]);

	useEffect(() => {
		if (information !== null) {
			const updateTransaction = async () => {
				await saveTransaction({
					userId: cookies.get('id'),
					productId: post_id,
					amount: Math.round(parseInt(information.TX_VALUE)),
					transactionId: information.transactionId,
					paymentType: 'PSE',
					paymentNetwork: information.pseBank
				});
			};
			updateTransaction();
		}
	},[information,post_id]);

	return (
		<div className="transactionReceipt-container">
			{information !== null && post_id !== undefined && userInformation !== null 
				? (
					<div>
						<div ref={transactionDocument}>
							<div className="transactionReceipt-title">
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<i className="fa fa-check" style={{ color: '#3282B8', fontSize: '40px', margin: '0 10px' }}></i>
									<h1>Apreciad@ {userInformation.firstName === '' ? userInformation.username : userInformation.firstName}</h1>
								</div>
								<p>A continuacion aparecen los datos de la compra del servicio. !FELICIDADES!</p>
								<div className="transactionReceipt-title-logo">
									<img src="/img/penssum-transparent.png" alt="icon-logo"/>
									<h1>PENSSUM</h1>
								</div>
							</div>
							<div className="transactionReceipt">
								<div className="transactionReceipt-table">
									<h2>RESULTADO DE LA TRANSACCION.</h2>
									<div className="information-transactionReceipt">
										<div>
											<p>ID del usuario</p>
											<p>{userInformation._id}</p>
										</div>
										<div>
											<p>ID del product</p>
											<p>{post_id}</p>
										</div>
										<div>
											<p>Fecha de la compra</p>
											<p>{changeDate(Date())}</p>
										</div>
										<div>
											<p>Estado de la compra</p>
											<p>{information.message}</p>
										</div>
										<div>
											<p>Referencia del pedido</p>
											<p>{information.referenceCode}</p>
										</div>
										<div>
											<p>Referencia de transaccion</p>
											<p>{information.transactionId}</p>
										</div>
										<div>
											<p>Numero de transaccion / CUS</p>
											<p>{information.cus}</p>
										</div>
										<div>
											<p>Banco</p>
											<p>{information.pseBank}</p>
										</div>
										<div>
											<p>Valor</p>
											<p>{information.TX_VALUE}$</p>
										</div>
										<div>
											<p>Valor del IVA</p>
											<p>{information.TX_TAX}$</p>
										</div>
										<div>
											<p>Valor total</p>
											<p>{parseInt(information.TX_VALUE) + parseInt(information.TX_TAX)}$</p>
										</div>
										<div>
											<p>Moneda</p>
											<p>{information.currency}</p>
										</div>
										<div>
											<p>Descripcion</p>
											<p>{information.description}</p>
										</div>
										<div>
											<p>Correo</p>
											<p>{information.buyerEmail}</p>
										</div>
										<div>
											<p>{information.pseReference2}</p>
											<p>{information.pseReference3}</p>
										</div>
										<div>
											<p>Plataforma</p>
											<p>PENSSUM</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="transactionReceipt-button-container">
							<Link to={`/post/information/${post_id}`}><button><i className="fa-solid fa-arrows-rotate"></i> Reintentar transaccion</button></Link>
							<Link to={`/post/information/${post_id}`}><button><i className="fa fa-check"></i> Finalizar transaccion</button></Link>
							<ReactToPrint
								trigger={() => <button><i className="fas fa-print"></i> Imprimir comprobante</button>}
								content={() => transactionDocument.current}
								documentTitle={`Documento de transaccion PENSSUM ${information.pseReference3}`}
								pageStyle="print"
							/>
						</div>
					</div>	
				) : <Loading margin="auto"/>}
		</div>
	);
};

export default TransactionReceipt;