import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { banksAvailable, payProduct } from '../../api';

import { thousandsSystem, randomName } from '../helpers';

import Loading from './Loading';
import swal from 'sweetalert';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function PayuForm ({ title, amount, userInformation, productTitle, paymentHandler, payment, setActivatePayment, cancel, setCancelActive, setAmountValue }) {
	const [zone,setZone] = useState('selection');
	const [banks,setBanks] = useState([]);
	const [loadingGeneral,setLoadingGeneral] = useState(false);
	const [sendingTransaction,setSendingTransaction] = useState(false);
	const [data,setData] = useState({
		cardType: null,
        name: '',
        documentType: 'CC',
        identificationNumber: '',
        cardNumber: '',
        securityCode: '',
        dueDate: {
            month: 'Mes',
            year: 'Año'
        },
        dues: 1,
        countryCode: '+57',
        phoneNumber: '',
        bank: '0',
        personType: 'Seleccione',
        termsAndConditions: false
	});

	const searchBanksAvailable = async () => {
        setLoadingGeneral(true);
        const obtainedData = await banksAvailable();
        setLoadingGeneral(false);

        if (obtainedData.code === 'ERROR'){
            swal({
                title: 'ERROR',
                text: obtainedData.error,
                icon: 'error',
                button: 'ok',
            });
            return
        };

        if (obtainedData.transactionResponse && obtainedData.transactionResponse.state === 'DECLINED') {
            swal({
                title: 'ERROR',
                text: `TRANSACCION NEGADA. CODIGO DE ERROR: ${obtainedData.transactionResponse.responseCode}. MENSAJE: ${obtainedData.transactionResponse.paymentNetworkResponseErrorMessage}`,
                icon: 'error',
                button: 'ok',
            });
            return
        } else {
            setBanks(obtainedData.banks);
            setZone('pse');
        };
    };

    useEffect(() => {
    	const error = document.querySelector('.incomplete-form');
        if (error) { error.classList.remove('showError'); }
    },[data]);

    useEffect(() => document.querySelector('body').style.overflow = 'hidden');

	const pay = async () => {
		const error = document.querySelector('.incomplete-form');
        error.classList.remove('showError');

		if (zone === 'card' && data.cardType !== null 
            && data.name !== '' && data.identificationNumber !== '' 
            && data.cardNumber !== '' && data.cardNumber.length > 12
            && data.cardNumber.length <= 16
            && data.securityCode !== '' && data.securityCode.length === 3
            && data.dueDate.month !== 'Mes' && data.dueDate.year !== 'Año' 
            && data.phoneNumber !== '' && data.termsAndConditions) {
            
            setSendingTransaction(true);

            const result = await payProduct({
                paymentType: 'card',
                userID: cookies.get('id'),
                name: productTitle,
                description: `Pago adelantado de la publicacion ${productTitle}.`,
                userEmail: userInformation.email,
                amount: /*Math.round(amount + amount * 0.04)*/ amount,
                cardType: data.cardType,
                fullName: data.name,
                documentType: data.documentType,
                identificationNumber: data.identificationNumber,
                city: userInformation.city,
                countryCode: data.countryCode,
                cardNumber: data.cardNumber,
                securityCode: data.securityCode,
                advance: true,
                dueDate: { month: data.dueDate.month, year: data.dueDate.year },
                phoneNumber: data.phoneNumber,
                userAgent: window.navigator.userAgent
            });

            setSendingTransaction(false);

            if (result.code === 'ERROR'){
                swal({
                    title: 'ERROR',
                    text: result.error,
                    icon: 'error',
                    button: 'ok',
                });
                return
            };

            if (result.transactionResponse.state === 'DECLINED') {
                swal({
                    title: 'ERROR',
                    text: `TRANSACCION NEGADA. CODIGO DE ERROR: ${result.transactionResponse.responseCode}. MENSAJE: ${result.transactionResponse.paymentNetworkResponseErrorMessage}`,
                    icon: 'error',
                    button: 'ok',
                });
                return
            };
            
            if (result.transactionResponse.state === 'APPROVED') {
                swal({
                    title: 'APROBADO',
                    text: `TRANSACCION REALIZADA CORRECTAMENTE, MONTO PAGADO: $${thousandsSystem(amount)} IVA: $${thousandsSystem(Math.round((amount * 0.19)))}, TOTAL: $${thousandsSystem(amount + Math.round((amount * 0.19)))}`,
                    icon: 'success',
                    button: '!Gracias!',
                }).then(() => {
                    setActivatePayment(false);
                    paymentHandler({ 
                        response: true,
                        paymentType: 'CARD'
                    });
                });

                return
            };
        };

        if (zone === 'pse' && data.name !== '' 
            && data.bank !== 0 && data.identificationNumber !== '' 
            && data.phoneNumber && data.termsAndConditions 
            && data.personType !== 'Seleccione') {
            
            setSendingTransaction(true);

        	const TOKEN = randomName(100);

            const result = await payProduct({
                paymentType: 'PSE',
                userID: cookies.get('id'),
                name: productTitle,
                description: 'Pago adelantado de la publicacion.',
                userEmail: userInformation.email,
                amount: /*Math.round(amount + amount * 0.04)*/ amount,
                bank: data.bank,
                nameOfOwner: data.name,
                personType: data.personType,
                RESPONSE_URL: `/post/information/${TOKEN}/transaction/receipt`,
                documentType: data.documentType,
                identificationNumber: data.identificationNumber,
                countryCode: data.countryCode,
                phoneNumber: data.phoneNumber,
                userAgent: window.navigator.userAgent
            });

            if (result.code === 'ERROR'){
                swal({
                    title: 'ERROR',
                    text: result.error,
                    icon: 'error',
                    button: 'ok',
                });
                return
            };

            if (result.transactionResponse.state === 'DECLINED') setSendingTransaction(false);
            else {
                setActivatePayment(false);
                paymentHandler({
                    response: 'pendding',
                    paymentType: 'PSE',
                    URL: result.transactionResponse.extraParameters.BANK_URL,
                    token: TOKEN
                });
                window.open(result.transactionResponse.extraParameters.BANK_URL, '_BLANK');
            };
            
            return
        };

        if ((zone === 'cash' || zone === 'bank') && data.termsAndConditions) {
            setSendingTransaction(true);

            const result = await payProduct({
                paymentType: zone,
                userID: cookies.get('id'),
                name: productTitle,
                description: 'Pago adelantado de la publicacion.',
                userEmail: userInformation.email,
                amount: /*Math.round(amount + amount * 0.04)*/ amount,
                city: userInformation.city,
                phoneNumber: userInformation.phoneNumber,
                identificationNumber: userInformation.identification ? userInformation.identification : userInformation.phoneNumber,
                userAgent: window.navigator.userAgent
            });

            setSendingTransaction(false);

            if (result.code === 'ERROR'){
                swal({
                    title: 'ERROR',
                    text: result.error,
                    icon: 'error',
                    button: 'ok',
                });
                return
            };

            if (result.transactionResponse.state === 'DECLINED') {
                swal({
                    title: 'ERROR',
                    text: `TRANSACCION NEGADA. CODIGO DE ERROR: ${result.transactionResponse.responseCode}. MENSAJE: ${result.transactionResponse.paymentNetworkResponseErrorMessage}`,
                    icon: 'error',
                    button: 'ok',
                });
                return
            } else {
                setActivatePayment(false);
                paymentHandler({
                    response: 'pendding',
                    paymentType: zone,
                    URL: result.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML
                });
                window.open(result.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML, '_BLANK');
            };
        };

        error.classList.add('showError');
	};

	return (
		<div className="simple-payu-form-container">
			{loadingGeneral && <Loading 
                center={true}
                background={true} 
                optionText={{
                    text: "...BUSCANDO BANCOS ACTIVOS...", 
                    colorText: "#FFFFFF",
                    fontSize: '26px'
            }}/>}
			<div className="simple-payu-form">
				<div className="simple-payu-card-header">
					<div className="simple-payu-card-header-divider">
						<h1 className="simple-payu-card-header-title">{title}</h1>
						<h4 className="simple-payu-card-header-amount-total">Dinero a pagar: <span>${thousandsSystem(amount/* + Math.round(amount * 0.04)*/)}</span></h4>
						{/*<p className="simple-payu-card-header-amount">Dinero propuesto: <span>${thousandsSystem(amount)}</span></p>*/}
						{/*<p className="simple-payu-card-header-amount-iva">Comisión: <span>${thousandsSystem(Math.round(amount * 0.04))}</span></p>*/}
					</div>
					{!sendingTransaction && (
                        <button className="simple-payu-form-exit-button" title="Salir" onClick={() => {
                            setActivatePayment(false);
                            paymentHandler(false);
                            if (setAmountValue) setAmountValue(null);
                        }}><i className="fas fa-chevron-left"></i></button>
                    )}
				</div>
				<hr/>
				<div className="simple-payu-card-body">
					{zone === 'selection' && (
						<div className="simple-payu-card-body-selection">
							<h4 className="simple-payu-card-body-selection-title">... PAGA CON ...</h4>
							<div className="payu-selection-zone-container">
								{(!payment || payment.card) && (
                                    <div className="payu-selection-zone" onClick={() => setZone('card')}>
                                        <img src="/img/payment_gateway/payu/credit-card.png" alt="card"/>
                                        <p>Tarjeta</p>
                                    </div>
                                )}
								{(!payment || payment.pse) && (
                                    <div className="payu-selection-zone" onClick={() => searchBanksAvailable()}>
                                        <img src="/img/payment_gateway/payu/bank-icon.png" alt="PSE"/>
                                        <p>Debito bancario PSE</p>
                                    </div>
                                )}
                                {(!payment || payment.bank) && (
                                    <div className="payu-selection-zone" onClick={() => setZone('bank')}>
                                        <img src="/img/payment_gateway/payu/payment-in-bank.png" alt="bank"/>
                                        <p>Pago en bancos</p>
                                    </div>
                                )}
                                {(!payment || payment.cash) && (
                                    <div className="payu-selection-zone" onClick={() => setZone('cash')}>
                                        <img src="/img/payment_gateway/payu/cash-card.png" alt="cash"/>
                                        <p>Pago en efectivo</p>
                                    </div>
                                )}
							</div>
                            {cancel && <p className="payu-not-yet" onClick={() => {
                                setCancelActive(true);
                                setActivatePayment(false);
                                paymentHandler(false);
                            }}>No pagar todavia.</p>}
						</div>
					)}
					{zone === 'card' && (
						<div className="simple-payu-card-body-selection">
							<div className="simple-payu-card-body-selection-nav">
								<h4 className="simple-payu-card-body-selection-title">TARJETA</h4>
								{!sendingTransaction && <i className="fas fa-chevron-left back-simple-payu-card-body-selection" title="Regresar" onClick={() => setZone('selection')}></i>}
							</div>
							<form onSubmit={e => e.preventDefault()}>
								<div className="simple-payu-form-control">
                                 	<p>Tipo de tarjeta *</p>
                                 	<div className="simple-payu-form-inputs">
                                     	<select defaultValue={data.documentType} onChange={e => setData({ ...data, cardType: e.target.value })}>
                                     		<option value="null" hidden>-- Seleccione su tipo de tarjeta -- </option>
                                            <option value="VISA">VISA</option>
                                            <option value="MASTERCARD">MASTERCARD</option>
                                            <option value="AMEX">AMEX</option>
                                            <option value="DINERS">DINERS</option>
                                            <option value="CODENSA">CODENSA</option>
                                     	</select>
                                 	</div>
                             	</div>
								<div className="simple-payu-form-control">
                                 	<p>Nombre en la tarjeta *</p>
                                 	<input type="text" placeholder="Nombre Completo" value={data.name} onChange={e => setData({ ...data, name: e.target.value })}/>
                             	</div>
                             	<div className="simple-payu-form-control">
                                 	<p>Documento de identificación *</p>
                                 	<div className="simple-payu-form-inputs">
                                     	<select defaultValue={data.documentType} onChange={e => setData({ ...data, documentType: e.target.value })}>
                                            <option value="CC">C.C. (Cedula de Ciudadania)</option>
                                            <option value="CE">C.E. (Cedula de Extranjeria)</option>
                                            <option value="NIT">NIT (Numero de Identificación tributaria)</option>
                                            <option value="PP">Pasaporte</option>
                                            <option value="OTHER">Otro</option>
                                     	</select>
                                     	<input type="number" placeholder="4035032332" value={data.identificationNumber} onChange={e => setData({ ...data, identificationNumber: e.target.value })}/>
                                 	</div>
                             	</div>
                             	<div className="simple-payu-form-control">
                                 	<p>Número de tarjeta *</p>
                                 	<input type="number" placeholder="4000 1234 5678 9010" maxLength="16" value={data.cardNumber} onChange={e => setData({ ...data, cardNumber: e.target.value })}/>
                             	</div>
                             	<div className="simple-payu-form-control">
                                 	<p>Código de seguridad *</p>
                                 	<input type="number" placeholder="000" maxLength="3" value={data.securityCode} onChange={e => setData({ ...data, securityCode: e.target.value })}/>
                             	</div>
                             	<div className="simple-payu-form-control">
                                 	<p>Fecha Vencimiento *</p>
                                    <div className="simple-payu-form-due-date">
                                        <select defaultValue={data.dueDate.month} onChange={e => setData({ ...data, dueDate: { ...data.dueDate, month: e.target.value }})}>
                                            <option value="Mes" hidden>-Mes-</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                            <option value="10">10</option>
                                            <option value="11">11</option>
                                            <option value="12">12</option>
                                        </select>
                                        <p style={{ fontSize: '24px', display: 'inline-block', margin: '0 16px', color: '#666666', fontWeight: '600' }}>/</p>
                                        <select defaultValue={data.dueDate.year} onChange={e => setData({ ...data, dueDate: { ...data.dueDate, year: e.target.value }})}>
                                            <option value="Año" hidden>-Año-</option>
                                            <option value="22">22</option>
                                            <option value="23">23</option>
                                            <option value="24">24</option>
                                            <option value="25">25</option>
                                            <option value="26">26</option>
                                            <option value="27">27</option>
                                            <option value="28">28</option>
                                            <option value="29">29</option>
                                            <option value="30">30</option>
                                            <option value="31">31</option>
                                            <option value="32">32</option>
                                            <option value="33">33</option>
                                            <option value="34">34</option>
                                            <option value="35">35</option>
                                            <option value="36">36</option>
                                            <option value="37">37</option>
                                            <option value="38">38</option>
                                            <option value="39">39</option>
                                            <option value="40">40</option>
                                            <option value="41">41</option>
                                            <option value="42">42</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Cuotas *</p>
                                    <select defaultValue={data.dues} onChange={e => setData({ ...data, dues: e.target.value })}>
                                    	<option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                        <option value="13">13</option>
                                        <option value="14">14</option>
                                        <option value="15">15</option>
                                        <option value="16">16</option>
                                        <option value="17">17</option>
                                        <option value="18">18</option>
                                        <option value="19">19</option>
                                        <option value="20">20</option>
                                        <option value="21">21</option>
                                        <option value="22">22</option>
                                        <option value="23">23</option>
                                        <option value="24">24</option>
                                        <option value="25">25</option>
                                        <option value="26">26</option>
                                        <option value="27">27</option>
                                        <option value="28">28</option>
                                        <option value="29">29</option>
                                        <option value="30">30</option>
                                        <option value="31">31</option>
                                        <option value="32">32</option>
                                        <option value="33">33</option>
                                        <option value="34">34</option>
                                        <option value="35">35</option>
                                        <option value="36">36</option>
                                    </select>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Teléfono Celular *</p>
                                    <div className="simple-payu-form-phone-number">
                                        <img src="/img/flags/Colombia.svg" alt="Colombia" style={{ width: '30px', margin: '0 10px' }}/>
                                        {/*<select defaultValue="+57" onChange={e => setData({ ...data, countryCode: e.target.value })}>
                                            <option value="+57">+57</option>
                                        </select>*/}
                                        <input type="number" placeholder="4162344332" value={data.phoneNumber} onChange={e => setData({ ...data, phoneNumber: e.target.value })} />
                                    </div>
                                </div>
							</form>
						</div>
					)}
					{zone === 'pse' && (
						<div className="simple-payu-card-body-selection">
							<div className="simple-payu-card-body-selection-nav">
								<h4 className="simple-payu-card-body-selection-title">PSE</h4>
								<i className="fas fa-chevron-left back-simple-payu-card-body-selection" title="Regresar" onClick={() => setZone('selection')}></i>
							</div>
							<form onSubmit={e => e.preventDefault()}>
                                <div className="simple-payu-form-control">
                                    <p>1.   Todas las compras y pagos por PSE son realizados en línea y la confirmación es inmediata.</p>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>2.   Algunos bancos tienen un procedimiento de autenticación en su página (por ejemplo, una segunda clave), si nunca has realizado pagos por internet con tu cuenta de ahorros o corriente, es posible que necesites tramitar una autorización ante tu banco.</p>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Bancos *</p>
                                    <select defaultValue={data.bank} onChange={e => setData({ ...data, bank: e.target.value })}>
                                        {banks.map(bank => <option key={bank.id} value={bank.pseCode}>{bank.description}</option>)}
                                    </select>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Nombre del titular *</p>
                                    <input type="text" placeholder={`${userInformation.firstName} ${userInformation.secondName} ${userInformation.lastName} ${userInformation.secondSurname}`} onChange={e => setData({ ...data, name: e.target.value })}/>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Tipo de Persona  *</p>
                                    <select defaultValue={data.personType} onClick={e => setData({ ...data, personType: e.target.value })}>
                                        <option value="Seleccione" hidden>- Seleccione -</option>
                                        <option value="N">Natural</option>
                                        <option value="J">Juridica</option>
                                    </select>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Documento de identificación *</p>
                                    <div className="simple-payu-form-inputs">
                                        <select defaultValue={data.documentType} onChange={e => setData({ ...data, documentType: e.target.value })}>
                                            <option value="CC">C.C. (Cedula de Ciudadania)</option>
                                            <option value="CE">C.E. (Cedula de Extranjeria)</option>
                                            <option value="CEL">CEL (Numero movil)</option>
                                            <option value="DE">D.E. (Documento de identificacion Extranjero)</option>
                                            <option value="IDC">IDC (Identificador unico de cliente)</option>
                                            <option value="NIT">NIT (Numero de Identificación tributaria)</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                            <option value="RC">R.C. (Registro civil)</option>
                                            <option value="TI">T.I (Tarjeta de identidad)</option>
                                        </select>
                                        <input type="number" placeholder="4035032332" value={data.identificationNumber} onChange={e => setData({ ...data, identificationNumber: e.target.value })}/>
                                    </div>
                                </div>
                                <div className="simple-payu-form-control">
                                    <p>Teléfono Celular *</p>
                                    <div className="simple-payu-form-phone-number">
                                        <img src="/img/flags/Colombia.svg" alt="Colombia" style={{ width: '30px', margin: '0 10px' }}/>
                                        <select defaultValue="+57" onChange={e => setData({ ...data, countryCode: e.target.value })}>
                                            <option value="+57">+57</option>
                                        </select>
                                        <input type="number" placeholder="4162344332" onChange={e => setData({ ...data, phoneNumber: e.target.value })}/>
                                    </div>
                                </div>
                            </form>
						</div>
					)}
                    {zone === 'cash' && (
                        <div className="simple-payu-card-body-selection">
                            <div className="simple-payu-card-body-selection-nav">
                                <h4 className="simple-payu-card-body-selection-title">EFECTIVO</h4>
                                <i className="fas fa-chevron-left back-simple-payu-card-body-selection" title="Regresar" onClick={() => setZone('selection')}></i>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>1.</b>    Haz click en el botón <b>"Generar número de pago"</b> para obtener el número que te pedirá el cajero de Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer.</p>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>2.</b>    Realiza el <b>Pago en efectivo</b> presentando el número que generaste, en cualquier punto Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer de Colombia.</p>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>3.</b>    <b>Una vez recibido tu pago en Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer,</b> PayU enviará la información del pago a <b>penxum</b>, que procederá a hacer la entrega del producto/servicio que estás adquiriendo.</p>
                            </div>
                        </div>
                    )}
                    {zone === 'bank' && (
                        <section className="simple-payu-card-body-selection">
                            <div className="simple-payu-card-body-selection-nav">
                                <h4 className="simple-payu-card-body-selection-title">BANCO</h4>
                                <i className="fas fa-chevron-left back-simple-payu-card-body-selection" title="Regresar" onClick={() => setZone('selection')}></i>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>1.</b>   Haz click en el botón <b>"Generar recibo de pago"</b> e imprime el recibo que te muestra.</p>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>2.</b>   Puedes realizar el pago <b>en efectivo</b> presentando el recibo <b>en cualquier sucursal de Banco de Bogotá, Bancolombia o Davivienda de Colombia</b>.</p>
                            </div>
                            <div className="simple-payu-form-control">
                                <p><b>3.</b>   <b>Una vez recibido tu pago en el banco,</b> PayU enviará la información del pago a penxum, que procederá a hacer la entrega del producto/servicio que estás adquiriendo.</p>
                            </div>
                        </section>
                    )}
					{zone !== 'selection' && (
						<div className="simple-payu-form-control terms_and_conditions-simple-payu">
                            <p>Acepto los <Link to="/help/information/mod=terms_and_conditions">términos y condiciones</Link> y autorizo el tratamiento de datos personales</p>
                            <button className="accept-terms_and_conditions-form-simple-payu" style={{ 
                                background: !data.termsAndConditions ? 'transparent' : '#3282B8',
                                border: !data.termsAndConditions ? '1px solid #444' : 'transparent'
                            }} onClick={e => setData({ ...data, termsAndConditions: !data.termsAndConditions })}></button>
                        </div>
					)}
					{zone !== 'selection' && (
						<div className="simple-payu-form-control">
                            <p className="field incomplete-form" style={{ width: '100%', textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '2px 0' }}>Rellena todos los datos correctamente.</p>
                        </div>
					)}
					{zone !== 'selection' && (
						<div className="simple-payu-form-control">
                            <button 
                            	className="pay-service-simple-payu" 
                            	tabIndex="0" 
                            	style={{ 
                                    background: sendingTransaction ? '#3282B8' : '', 
                                    opacity: sendingTransaction ? '.4' : '', 
                                    cursor: sendingTransaction ? 'not-allowed' : '' 
                                }}
                            	onClick={() => { if (!sendingTransaction) pay() }}>{zone === 'cash' ? 'Generar número de pago' : zone === 'bank' ? 'Generar recibo de pago' : 'Pagar'}</button>
                        </div>
					)}
				</div>
			</div>
		</div>
	)
}

export default PayuForm;