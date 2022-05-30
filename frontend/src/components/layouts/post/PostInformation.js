import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { changeDate } from '../../helpers';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import swal from 'sweetalert';

import { 
    getProducts, 
    makeOffer, 
    getOffer, 
    increaseView, 
    reviewBlocked, 
    changeVideoCallURL, 
    payProduct,
    banksAvailable,
    socket,
    deleteProduct,
    removeFiles,
    vote,
    getVote
} from '../../../api';
import Loading from '../../parts/Loading';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function PostInformation({ auth, userInformation, isTheUserSuspended, setMainProducts }) {
    const [activatePayment,setActivatePayment] = useState(false);
    const [offerVerification, setOfferVerification] = useState(null);
    const [offer, setOffer] = useState(null);
    const [product, setProduct] = useState(null);
    const [position, setPosition] = useState(0);
    const [copied, setCopied] = useState(false);
    const [sendingTransaction,setSendingTransaction] = useState(false);
    const [banks,setBanks] = useState([]);
    const [loadingGeneral,setLoadingGeneral] = useState(false);
    const [width,setWidth] = useState(window.innerWidth);
    const [score,setScore] = useState(0);
    const [scoreUpdated,setScoreUpdated] = useState(false);
    const [sendingInformation,setSendingInformation] = useState(false);

    const changeWidth = () => setWidth(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', changeWidth);
        return (() => window.removeEventListener('resize', changeWidth));
    });

    const [paymentDetails,setPaymentDetails] = useState({
        type: 'select',
        cardType: null,
        name: '',
        documentType: 'C.C.',
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

    const { post_id } = useParams();
    const navigate = useNavigate();

    const closeTimerCopied = useRef();
    const closeTimerScoreUpdated = useRef();
    const eventZone = useRef();
    const resetVideoCallURL = useRef();
    const voteTimer = useRef();

    useEffect(() => {
        const checkVote = async () => {
            if (product !== null) {
                const result = await getVote({ 
                    from: cookies.get('id'), 
                    to: product.owner,
                    productId: product._id,
                    voteType: 'product'
                });

                setScore(result.vote);
            };
        };
        checkVote();
    },[product]);

    useEffect(() => {
        if (activatePayment) document.querySelector('body').style.overflow = 'hidden';
        else document.querySelector('body').style.overflow = 'auto';
    },[activatePayment]);

    useEffect(() => {
        if (copied) {
            clearTimeout(closeTimerCopied.current);
            closeTimerCopied.current = setTimeout(() => setCopied(false),2000);
        };
    },[copied]);

    useEffect(() => {
        const searchOffers = async () => {
            const result = await getOffer({ id_product: post_id });
            if (!result.error) setOffer(result);
        };
        searchOffers();
    }, [post_id]);

    useEffect(() => {
        if (auth) {
            const checkOffer = async () => {
                const result = await getOffer({ id_user: userInformation._id, id_product: post_id });
                if (!result.error) setOfferVerification({ 
                    amount: result.amount, 
                    acceptOffer: result.acceptOffer,
                    isThePayment: result.isThePayment,
                    isBought: result.isBought
                });
            };
            checkOffer();
        };
    }, [auth, post_id, userInformation]);

    useEffect(() => {
        const watchLock = async () => {
            const result = await reviewBlocked({ from: userInformation._id, to: post_id, product: true });

            if (result.length > 0) { navigate('/') };
        };
        watchLock();
    }, [post_id, userInformation, navigate]);

    useEffect(() => {
        const searchProducts = async () => {
            const productObtained = await getProducts({ id: post_id });
            if (productObtained.error || productObtained.length === 0) navigate('/')
            else {
                setProduct(productObtained);
                if (auth) { await increaseView(post_id) };
            };
        };
        searchProducts();
    }, [post_id, navigate, auth]);

    useEffect(() => {
        if (scoreUpdated) {
            clearTimeout(closeTimerScoreUpdated.current);
            closeTimerScoreUpdated.current = setTimeout(() => setScoreUpdated(false),2000);
        };
    },[scoreUpdated]);

    const createOffer = async () => {
        document.querySelector('.field-make-offer').classList.remove('showError');
        document.querySelector('.field-make-offer-no-input').classList.remove('showError');
        const value = document.getElementById('make-offer').value;

        if (value === '') return document.querySelector('.field-make-offer-no-input').classList.add('showError');

        if (/^[0-9]{0,20}$/.test(value)) {
            const data = {
                mainInformation: {
                    product: post_id,
                    user: userInformation._id,
                    amount: parseInt(value),
                    username: userInformation.username,
                    firstName: userInformation.firstName,
                    lastName: userInformation.lastName
                },
                notification: product.owner
            };

            setSendingInformation(true);
            const result = await makeOffer(data);
            setSendingInformation(false);

            if (result.error) {
                swal({
                    title: 'Error',
                    text: 'Hubo un error al hacer la peticion, intentelo otra vez',
                    icon: 'error',
                    timer: '3000',
                    button: false
                });
            } else {
                swal({
                    title: 'Enviado',
                    text: 'Ha sido enviado satisfactoriamente la oferta',
                    icon: 'success',
                    timer: '3000',
                    button: false
                });

                setOfferVerification({ amount: parseInt(value), acceptOffer: false });
            };

        } else document.querySelector('.field-make-offer').classList.add('showError');

        socket.emit('received event', product.owner);
    };

    const changeURL = () => {
        swal({
            title: '¿Estas seguro?',
            text: '¿Quieres cambiar el link de la videollamada?.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                resetVideoCallURL.current.style.display = 'none';
                const productUpdated = await changeVideoCallURL({ post_id });
                setProduct(productUpdated);
                resetVideoCallURL.current.style.display = 'flex';
                swal({
                    title: '!Cambiado con exito!',
                    text: `La nueva url es ${productUpdated.videoCall}.`,
                    icon: 'success',
                    timer: '3000',
                    button: false,
                });
            };
        });
    };

    const pay = async () => {
        const error = document.querySelector('.incomplete-form');
        error.classList.remove('showError');

        if (paymentDetails.type === 'card' && paymentDetails.cardType !== null 
            && paymentDetails.name !== '' && paymentDetails.identificationNumber !== '' 
            && paymentDetails.cardNumber !== '' && paymentDetails.cardNumber.length > 12
            && paymentDetails.cardNumber.length <= 16
            && paymentDetails.securityCode !== '' && paymentDetails.securityCode.length === 3
            && paymentDetails.dueDate.month !== 'Mes' && paymentDetails.dueDate.year !== 'Año' 
            && paymentDetails.phoneNumber !== '' && paymentDetails.termsAndConditions) {
            
            setSendingTransaction(true);

            const result = await payProduct({
                paymentType: 'card',
                productID: post_id,
                ownerId: product.owner,
                userID: cookies.get('id'),
                productName: product.title,
                productDescription: product.description,
                userEmail: userInformation.email,
                category: product.category,
                customCategory: product.customCategory,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value,
                cardType: paymentDetails.cardType,
                fullName: paymentDetails.name,
                documentType: paymentDetails.documentType,
                identificationNumber: paymentDetails.identificationNumber,
                city: userInformation.city,
                countryCode: paymentDetails.countryCode,
                cardNumber: paymentDetails.cardNumber,
                securityCode: paymentDetails.securityCode,
                dueDate: { month: paymentDetails.dueDate.month, year: paymentDetails.dueDate.year },
                phoneNumber: paymentDetails.phoneNumber,
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
                    text: `TRANSACCION REALIZADA CORRECTAMENTE, MONTO PAGADO: ${offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value}$ IVA: ${Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) * 0.19)}$, TOTAL: ${(offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) + Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) * 0.19)}$`,
                    icon: 'success',
                    button: '!Gracias!',
                });

                setActivatePayment(false);
                setOfferVerification({
                    ...offerVerification,
                    amount: offerVerification.amount ? offerVerification.amount : product.value,
                    acceptOffer: true,
                    isThePayment: true,
                    isBought: true,
                });

                return
            };
        };

        if (paymentDetails.type === 'PSE' && paymentDetails.name !== '' 
            && paymentDetails.bank !== 0 && paymentDetails.identificationNumber !== '' 
            && paymentDetails.phoneNumber && paymentDetails.termsAndConditions 
            && paymentDetails.personType !== 'Seleccione') {
            
            setSendingTransaction(true);

            const result = await payProduct({
                paymentType: 'PSE',
                productID: post_id,
                userID: cookies.get('id'),
                productName: product.title,
                productDescription: product.description,
                userEmail: userInformation.email,
                category: product.category,
                customCategory: product.customCategory,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value,
                bank: paymentDetails.bank,
                nameOfOwner: paymentDetails.name,
                personType: paymentDetails.personType,
                documentType: paymentDetails.documentType,
                identificationNumber: paymentDetails.identificationNumber,
                countryCode: paymentDetails.countryCode,
                phoneNumber: paymentDetails.phoneNumber,
                userAgent: window.navigator.userAgent
            });

            if (result.transactionResponse.state === 'DECLINED') setSendingTransaction(false);
            else window.location.href = result.transactionResponse.extraParameters.BANK_URL;
            
            return
        };

        if ((paymentDetails.type === 'cash' || paymentDetails.type === 'bank') && paymentDetails.termsAndConditions) {
            setSendingTransaction(true);

            const result = await payProduct({
                paymentType: paymentDetails.type,
                productID: post_id,
                userID: cookies.get('id'),
                productName: product.title,
                productDescription: product.description,
                userEmail: userInformation.email,
                category: product.category,
                customCategory: product.customCategory,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value,
                city: userInformation.city,
                phoneNumber: userInformation.phoneNumber,
                identificationNumber: userInformation.identification,
                userAgent: window.navigator.userAgent
            });

            setSendingTransaction(false);

            if (result.transactionResponse.state === 'DECLINED') {
                swal({
                    title: 'ERROR',
                    text: `TRANSACCION NEGADA. CODIGO DE ERROR: ${result.transactionResponse.responseCode}. MENSAJE: ${result.transactionResponse.paymentNetworkResponseErrorMessage}`,
                    icon: 'error',
                    button: 'ok',
                });
                return
            } else window.location.href = result.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML;
        };

        error.classList.add('showError');
        setSendingTransaction(false);
    };

    const searchBanksAvailable = async () => {
        setLoadingGeneral(true);
        const data = await banksAvailable();
        setLoadingGeneral(false);
        if (data.transactionResponse && data.transactionResponse.state === 'DECLINED') {
            swal({
                title: 'ERROR',
                text: `TRANSACCION NEGADA. CODIGO DE ERROR: ${data.transactionResponse.responseCode}. MENSAJE: ${data.transactionResponse.paymentNetworkResponseErrorMessage}`,
                icon: 'error',
                button: 'ok',
            });
            return
        } else {
            setBanks(data.banks);
            setPaymentDetails({ ...paymentDetails, type: 'PSE' });
        }
    };

    const removeProduct = () => {
        swal({
            title: '¿Estas seguro?',
            text: '¿Quieres eliminar el producto con todas las ofertas?.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                eventZone.current.style.display = 'none';
                await removeFiles({ files: product.files, activate: true });
                await deleteProduct({ id: post_id, notification: false });
                const products = await getProducts();
                setMainProducts(products);
                navigate('/');
            };
        });
    };

    const voteUser = currentVote => {
        clearTimeout(voteTimer.current)

        setScore(currentVote);
        if (currentVote === score) setScore(0);   
    
        voteTimer.current = setTimeout(async () => {
            await vote({ 
                from: cookies.get('id'), 
                to: product.owner, 
                productId: product._id, 
                vote: currentVote === score ? 0 : currentVote 
            });

            setScoreUpdated(true);
        },1400);
    };

    return product !== null ? (
        <div className="post-information-container">
            {loadingGeneral && <Loading 
                center={true}
                background={true} 
                optionText={{
                    text: "...BUSCANDO BANCOS ACTIVOS...", 
                    colorText: "#FFFFFF",
                    fontSize: '26px'
            }}/>}
            <div className="post-information">
                <section>
                    <div className="post-information-photos-container">
                        {position !== 0 ? <i className="fa-solid fa-circle-arrow-left" id="fa-circle-arrow-left-post-information-photos" onClick={() => setPosition(position - 1)}></i> : <></>}
                        <div className="post-information-photos" style={{ width: `${product.files.length}00%` }}>
                            {product.files.map(file => {
                                return (
                                    <div className='post-photo' key={file.uniqueId} style={{ transform: `translateX(-${position}00%)` }}>
                                        <a href={file.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                            <img src={/pdf|epub|azw|ibook|doc|docx/.test(file.extname)
                                                ? file.extname === '.pdf' ? '/img/pdf_image.svg'
                                                    : file.extname === '.docx' || file.extname === '.doc' ? '/img/word_image.svg'
                                                        : '/img/document_image.svg'
                                                : file.url} alt="lamborghini" />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                        {position + 1 !== product.files.length ? <i className="fa-solid fa-circle-arrow-right" id="fa-circle-arrow-right-post-information-photos" onClick={() => setPosition(position + 1)}></i> : <></>}
                    </div>
                    <p id="post_id">SERIAL: {product === null ? 'Cargando...' : product._id}</p>
                    {product.owner === userInformation._id && product.stateActivated
                        ? <Link className="service-offer-post-information" to={`/post/information/${post_id}/control`}>Panel de control {offer !== null ? <span id="count-offers">{offer.length}</span> : ''}</Link>
                        : <></>}
                </section>
                <section className="post-information-card-container">
                    <div className="post-information-card">
                        {!product.stateActivated ? <h1 style={{ color: '#ff9900', margin: '10px 0' }}><i className="fas fa-history" style={{ color: '#ff9900', fontSize: '35px' }}></i> Este producto se encuentra en revision.</h1> : ''}
                        {product.owner === userInformation._id && (
                            <div className="main-post-information" ref={eventZone}>
                                <h1 className="main-post-information-category">Categoria: <span>{product.category}</span></h1>
                                <button title="Borrar producto" id="delete-product" onClick={() => removeProduct()}><i className="fa-solid fa-trash-can"></i></button>
                            </div>
                        )}
                        <h1 className="main-post-information-subcategory">Subcategoria: <span>{product.subCategory}</span></h1>
                        <h1 className="post-information-subcategory">Subcategoria Personalizada: <span>{product.customCategory}</span></h1>
                        <h1 className="post-information-title">Titulo: <span>{product.title}</span></h1>
                        <p className="post-information-description">{product.description}</p>
                    </div>
                    <div className="post-value-container">
                        <div className="value-information-container">
                            <label>Valor del producto</label>
                            <h1 className="post-producto-value">{product.value === null ? 'Negociable' : `${product.value}$`}</h1>
                        </div>
                        <div className="date-and-call-video-container">
                            <h1 className="post-information-date">Fecha: {product.dateOfDelivery === null ? 'Indefinido' : changeDate(product.dateOfDelivery)}</h1>
                            {auth && product.stateActivated && ((offerVerification !== null && offerVerification.acceptOffer && offerVerification.isThePayment) || (product.owner === userInformation._id)) && product.videoCall && (
                                <div className="post-video_call-zone">
                                    <p className="post-call-video-link">Link de la videollamada:</p>
                                    <div className="post-video_call-link-container">
                                        <Link className="post-video_call-link" to={`/video_call/meeting/${product.videoCall}`}>{product.videoCall}</Link>
                                        <div className="option-post-video_call">
                                            <CopyToClipboard 
                                                text={`http://localhost:3000/video_call/meeting/${product.videoCall}`} 
                                                onCopy={() => setCopied(true)}>
                                                <i className="fa-solid fa-copy" title="Copiar"></i>
                                            </CopyToClipboard>
                                            {product.owner === userInformation._id && <i className="fa-solid fa-arrow-rotate-left" title="Cambiar URL" ref={resetVideoCallURL} onClick={() => changeURL()}></i>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {((offerVerification === null && product.value !== null) || (offerVerification !== null && !offerVerification.isThePayment && !offerVerification.isBought && offerVerification.acceptOffer)) && auth && product.owner !== userInformation._id && product.stateActivated && product.paymentMethod && (
                        <div className="pay-method-post">
                            <p className="pay-method-post-title">Metodo de pago del servicio.</p>
                            <section className="pay-options-post" onClick={() => { setActivatePayment(true); setPaymentDetails({ ...paymentDetails, type: 'select' }) }}><img src="/img/payu.png" alt="payu"/></section>
                        </div>
                    )}
                    {offerVerification !== null && offerVerification.isThePayment && (product.owner !== userInformation._id) && (
                        <div className="vote-in-post-container">
                            <h1>Puntuar a {product.creatorUsername}</h1>
                            <div className="vote-in-post">
                                <i className="fas fa-star" style={{ color: score === 5 ? '#fe7' : '',  textShadow: score === 5 ? '0 0 20px #952' : '' }} onClick={() => voteUser(5)}></i>
                                <i className="fas fa-star" style={{ color: score === 4 || score === 5 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(4)}></i>
                                <i className="fas fa-star" style={{ color: score === 3 || score === 5 || score === 4 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(3)}></i>
                                <i className="fas fa-star" style={{ color: score === 2 || score === 5 || score === 4 || score === 3 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(2)}></i>
                                <i className="fas fa-star" style={{ color: score === 1 || score === 5 || score === 4 || score === 3 || score === 2 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(1)}></i>
                            </div>
                        </div>
                    )}
                    {offerVerification === null && auth && (product.owner !== userInformation._id && product.stateActivated)
                        ? !isTheUserSuspended ? (
                            <div className="post-send-container">
                                <input type="number" placeholder="Hacer una oferta" id="make-offer" onChange={() => {
                                    document.querySelector('.field-make-offer').classList.remove('showError');
                                    document.querySelector('.field-make-offer-no-input').classList.remove('showError');
                                }}/>
                                <button
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}  
                                    onClick={() => { if (!sendingInformation) createOffer() }}
                                >Enviar</button>
                            </div>
                        ) : <p className="youAreSuspended">Estas suspendido, no puedes hacer una oferta</p>
                        : auth && product.owner !== userInformation._id && <p className="field" style={{ display: 'block', color: '#3282B8', fontSize: '22px', margin: '20px auto', textAlign: 'center' }}>{
                                offerVerification.isBought && offerVerification.isThePayment 
                                    ? `Compraste este servicio por ${offerVerification.amount}$` 
                                    : `Su oferta ${offerVerification.amount !== 0 ? `de ${offerVerification.amount}$` : 'GRATIS'} ${offerVerification.acceptOffer 
                                        ? `ha sido aceptada${!offerVerification.isThePayment ? ', Por favor page el servicio' : ''}`
                                        : 'esta en revision'
                                    }`
                                }
                            .</p>
                        }
                    <p className="field field-make-offer-no-input">Escriba un valor.</p>
                    <p className="field field-make-offer">La oferta no debe tener mas de 10 caracteres.</p>
                    <div style={{ marginTop: '20px' }}>
                        <Link to={`/${product.creatorUsername}`} style={{ textDecoration: 'none' }}><button id="goToProfile">Ir al perfil del creador</button></Link>
                    </div>
                </section>
            </div>
            {activatePayment && (
                <div className="payu-payment-form-container">
                    <div className="payu-payment-form-title-container">
                            <div className="payu-payment-form-title">
                                <span>1</span>
                                {((paymentDetails.type === 'select' && width <= 600) || width > 600) && <h1>Selecciona el medio de pago</h1>}
                            </div>
                            <div className="payu-payment-leave">
                                {paymentDetails.type !== 'select' && <p onClick={() => setPaymentDetails({
                                    type: 'select',
                                    cardType: null,
                                    name: '',
                                    documentType: 'C.C.',
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
                                    banks: 'select',
                                    personType: 'select',
                                    termsAndConditions: false
                                })}><i className="fa-solid fa-arrows-rotate" style={{ fontSize: '20px' }}></i> Cambiar medio de pago</p>}
                                <i className="fas fa-chevron-left" onClick={() => { setActivatePayment(false); setPaymentDetails({
                                    type: 'select',
                                    cardType: null,
                                    name: '',
                                    documentType: 'C.C.',
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
                                    banks: 'select',
                                    personType: 'select',
                                    termsAndConditions: false
                                })} }></i>
                            </div>
                        </div>
                    <div className="payu-payment-form">
                        <div className="payment-information-container">
                            <div className="payment-method-options-select">
                                {(paymentDetails.type === 'select' || paymentDetails.type === 'card') && (
                                    <div className="payment-method-options-form">
                                        <p>Tarjeta de crédito o débito</p>
                                        <div className="payemnt-option-cards-container">
                                            <img src="/img/payment_gateway/payu/cards/Visa.png" alt="Visa" onClick={() => setPaymentDetails({ ...paymentDetails, type: 'card', cardType: 'VISA', })} style={{ boxShadow: paymentDetails.cardType === 'VISA' ? '0px 6px 12px #3282B8aa' : ''}}/>
                                            <img src="/img/payment_gateway/payu/cards/MasterCard.png" alt="MasterCard" onClick={() => setPaymentDetails({ ...paymentDetails, type: 'card', cardType: 'MASTERCARD' })} style={{ boxShadow: paymentDetails.cardType === 'MASTERCARD' ? '0px 6px 12px #3282B8aa' : ''}}/>
                                            <img src="/img/payment_gateway/payu/cards/AMEX.png" alt="AMEX" onClick={() => setPaymentDetails({ ...paymentDetails, type: 'card', cardType: 'AMEX', })} style={{ boxShadow: paymentDetails.cardType === 'AMEX' ? '0px 6px 12px #3282B8aa' : ''}}/>
                                            <img src="/img/payment_gateway/payu/cards/Diners.png" alt="Diners" onClick={() => setPaymentDetails({ ...paymentDetails, type: 'card', cardType: 'DINERS', })} style={{ boxShadow: paymentDetails.cardType === 'DINERS' ? '0px 6px 12px #3282B8aa' : ''}}/>
                                            <img src="/img/payment_gateway/payu/cards/Codensa.png" alt="Codensa" onClick={() => setPaymentDetails({ ...paymentDetails, type: 'card', cardType: 'CODENSA', })} style={{ boxShadow: paymentDetails.cardType === 'CODENSA' ? '0px 6px 12px #3282B8aa' : ''}}/> 
                                        </div>
                                    </div>
                                )}
                                {(paymentDetails.type === 'select' || paymentDetails.type === 'PSE') && (
                                    <div className="payment-method-options-form">
                                        <p>Debito bancario PSE</p>
                                        <div className="payemnt-option-cards-container">
                                            <img src="/img/payment_gateway/payu/PSE.png" alt="PSE" id="PSE-image" style={{ boxShadow: paymentDetails.type === 'PSE' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => searchBanksAvailable()}/>
                                            {(width >= 650 || (width > 500 && width < 600)) && (
                                                <div className="payemnt-option-cards-information">
                                                    <i className="fa-solid fa-circle-exclamation"></i>
                                                    <p>Recuerda verificar el monto máximo que tienes habilitado para pagos por internet. Nequi Y DAVIDPlata.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(paymentDetails.type === 'select' || paymentDetails.type === 'cash') && (
                                    <div className="payment-method-options-form">
                                        <p>Pago en efectivo</p>
                                        <div className="payemnt-option-cash-container">
                                            <img src="/img/payment_gateway/payu/cash/Via.svg" alt="Via" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>
                                            <img src="/img/payment_gateway/payu/cash/PagaTodoParaTodo.svg" alt="Paga Todo Para Todo" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>
                                            <img src="/img/payment_gateway/payu/cash/ApuestaCucuta.png" alt="Apuesta Cucuta" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>
                                            <img src="/img/payment_gateway/payu/cash/Gana.png" alt="Gana" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/GanaGana.jpg" alt="Gana Gana" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/Suchance.png" alt="Suchance" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/Acertemos.jpg" alt="Acertemos" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/LaPerla.png" alt="La perla" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/ApuestaUnidad.jpg" alt="Apuesta Unidad" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/Jer.jpg" alt="Jer" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                            {product.value >= 20000 && paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/Efecty.png" alt="Efecty" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
                                        </div>
                                    </div>
                                )}
                                {(paymentDetails.type === 'select' || paymentDetails.type === 'bank') && (
                                    <div className="payment-method-options-form" style={{ border: 'none' }}>
                                        <p>Pago en bancos</p>
                                        <div className="payemnt-option-cards-container">
                                            {(width >= 650 || (width > 500 && width < 600)) && <img src="/img/payment_gateway/payu/bank_payments/Banco_de_Bogota.png" alt="Banco de bogota" style={{ width: '150px', height: '30px', padding: '0 5px', boxShadow: paymentDetails.type === 'bank' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'bank' })}/>}
                                            <img src="/img/payment_gateway/payu/bank_payments/Bancolombia.png" alt="Bancolombia" style={{ width: '150px', height: '30px', padding: '0 5px', boxShadow: paymentDetails.type === 'bank' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'bank' })}/>
                                            {width >= 360 && <img src="/img/payment_gateway/payu/bank_payments/Davivienda.png" alt="Davivienda" style={{ width: '150px', height: '30px', padding: '0 5px', boxShadow: paymentDetails.type === 'bank' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'bank' })}/>}
                                        </div>
                                    </div>
                                )}
                                {paymentDetails.type !== 'select' 
                                    && paymentDetails.type === 'card' ? (
                                        <form onSubmit={e => e.preventDefault()} className="payment-method-form-control-container">
                                            <div className="payment-method-form-control">
                                                <p>Tipo de tarjeta: </p>
                                                <p style={{ color: '#3282B8' }}>{paymentDetails.cardType}</p>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Nombre en la tarjeta *</p>
                                                <input type="text" placeholder="Nombre Completo" value={paymentDetails.name} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })}/>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Documento de identificación *</p>
                                                <div className="payment-method-form-inputs">
                                                    <select defaultValue={paymentDetails.documentType} onChange={e => setPaymentDetails({ ...paymentDetails, documentType: e.target.value })}>
                                                        <option value="CC">C.C. (Cedula de Ciudadania)</option>
                                                        <option value="CE">C.E. (Cedula de Extranjeria)</option>
                                                        <option value="NIT">NIT (Numero de Identificación tributaria)</option>
                                                        <option value="PP">Pasaporte</option>
                                                        <option value="OTHER">Otro</option>
                                                    </select>
                                                    <input type="number" placeholder="4035032332" value={paymentDetails.identificationNumber} onChange={e => setPaymentDetails({ ...paymentDetails, identificationNumber: e.target.value })}/>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Número de tarjeta *</p>
                                                <input type="number" placeholder="4000 1234 5678 9010" maxLength="16" value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}/>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Código de seguridad *</p>
                                                <input type="number" placeholder="000" maxLength="3" value={paymentDetails.securityCode} onChange={e => setPaymentDetails({ ...paymentDetails, securityCode: e.target.value })}/>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Fecha Vencimiento *</p>
                                                <div className="payment-method-form-due-date">
                                                    <select defaultValue={paymentDetails.dueDate.month} onChange={e => setPaymentDetails({ ...paymentDetails, dueDate: { ...paymentDetails.dueDate, month: e.target.value }})}>
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
                                                    <p style={{ fontSize: '24px', display: 'inline-block' }}>/</p>
                                                    <select defaultValue={paymentDetails.dueDate.year} onChange={e => setPaymentDetails({ ...paymentDetails, dueDate: { ...paymentDetails.dueDate, year: e.target.value }})}>
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
                                            <div className="payment-method-form-control">
                                                <p>Cuotas *</p>
                                                <select defaultValue={paymentDetails.dues} onChange={e => setPaymentDetails({ ...paymentDetails, dues: e.target.value })}>
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
                                            <div className="payment-method-form-control">
                                                <p>Teléfono Celular *</p>
                                                <div className="payment-method-form-phone-number">
                                                    <img src="/img/flags/Colombia.svg" alt="Colombia" style={{ width: '30px', margin: '0 10px' }}/>
                                                    <select defaultValue="+57" onChange={e => setPaymentDetails({ ...paymentDetails, countryCode: e.target.value })}>
                                                        <option value="+57">+57</option>
                                                    </select>
                                                    <input type="number" placeholder="4162344332" value={paymentDetails.phoneNumber} onChange={e => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })} />
                                                </div>
                                            </div>
                                        </form>
                                    ) : paymentDetails.type === 'PSE' ? (
                                        <section className="payment-method-form-control-container">
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p>1.   Todas las compras y pagos por PSE son realizados en línea y la confirmación es inmediata.</p>
                                            </div>
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p>2.   Algunos bancos tienen un procedimiento de autenticación en su página (por ejemplo, una segunda clave), si nunca has realizado pagos por internet con tu cuenta de ahorros o corriente, es posible que necesites tramitar una autorización ante tu banco.</p>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Bancos *</p>
                                                <select defaultValue={paymentDetails.bank} style={{ width: '300px' }} onChange={e => setPaymentDetails({ ...paymentDetails, bank: e.target.value })}>
                                                    {banks.map(bank => <option key={bank.id} value={bank.pseCode}>{bank.description}</option>)}
                                                </select>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Nombre del titular *</p>
                                                <input type="text" placeholder={`${userInformation.firstName} ${userInformation.secondName} ${userInformation.lastName} ${userInformation.secondSurname}`} style={{ width: '300px' }} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })}/>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Tipo de Persona  *</p>
                                                <select defaultValue={paymentDetails.personType} style={{ width: '300px' }} onClick={e => setPaymentDetails({ ...paymentDetails, personType: e.target.value })}>
                                                    <option value="Seleccione" hidden>- Seleccione -</option>
                                                    <option value="N">Natural</option>
                                                    <option value="J">Juridica</option>
                                                </select>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Documento de identificación *</p>
                                                <div className="payment-method-form-inputs">
                                                    <select defaultValue={paymentDetails.documentType} onChange={e => setPaymentDetails({ ...paymentDetails, documentType: e.target.value })}>
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
                                                    <input type="number" placeholder="4035032332" value={paymentDetails.identificationNumber} onChange={e => setPaymentDetails({ ...paymentDetails, identificationNumber: e.target.value })}/>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control">
                                                <p>Teléfono Celular *</p>
                                                <div className="payment-method-form-phone-number">
                                                    <img src="/img/flags/Colombia.svg" alt="Colombia" style={{ width: '30px', margin: '0 10px' }}/>
                                                    <select defaultValue="+57" onChange={e => setPaymentDetails({ ...paymentDetails, countryCode: e.target.value })}>
                                                        <option value="+57">+57</option>
                                                    </select>
                                                    <input type="number" placeholder="4162344332" onChange={e => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}/>
                                                </div>
                                            </div>
                                        </section>
                                    ) : paymentDetails.type === 'cash' ? (
                                        <section className="payment-method-form-control-container">
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>1.</b>    Haz click en el botón <b>"Generar número de pago"</b> para obtener el número que te pedirá el cajero de Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-file-lines" style={{ margin: '0 auto' }}></i>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>2.</b>    Realiza el <b>Pago en efectivo</b> presentando el número que generaste, en cualquier punto Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer de Colombia.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-person-walking-arrow-right"></i>
                                                    <i className="fa-solid fa-building"></i>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>3.</b>    <b>Una vez recibido tu pago en Pagatodo, Apuestas Cucuta 75, Gana, Gana Gana, Su Chance, Acertemos, La Perla, Apuestas Unidas o Jer,</b> PayU enviará la información del pago a <b>penxum</b>, que procederá a hacer la entrega del producto/servicio que estás adquiriendo.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-file-circle-check"></i>
                                                    <i className="fa-solid fa-circle-right" style={{ fontSize: '30px' }}></i>
                                                    <i className="fa-solid fa-shop"></i>
                                                </div>
                                            </div>
                                        </section>
                                    ) : paymentDetails.type === 'bank' && (
                                        <section className="payment-method-form-control-container">
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>1.</b>   Haz click en el botón <b>"generar recibo de pago"</b> e imprime el recibo que te muestra.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-print"></i>
                                                    <i className="fa-solid fa-circle-right" style={{ fontSize: '30px' }}></i>
                                                    <i className="fa-solid fa-file-lines"></i>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>2.</b>   Puedes realizar el pago <b>en efectivo</b> presentando el recibo <b>en cualquier sucursal de Banco de Bogotá, Bancolombia o Davivienda de Colombia</b>.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-person-walking-arrow-right"></i>
                                                    <i className="fa-solid fa-building-columns"></i>
                                                </div>
                                            </div>
                                            <div className="payment-method-form-control" style={{ textAlign: 'justify' }}>
                                                <p className="bank-payment-method-information"><b>3.</b>   <b>Una vez recibido tu pago en el banco,</b> PayU enviará la información del pago a penxum, que procederá a hacer la entrega del producto/servicio que estás adquiriendo.</p>
                                                <div className="payment-method-form-icon">
                                                    <i className="fa-solid fa-file-circle-check"></i>
                                                    <i className="fa-solid fa-circle-right" style={{ fontSize: '30px' }}></i>
                                                    <i className="fa-solid fa-shop"></i>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                    {paymentDetails.type !== 'select' && (
                                        <div className="payment-method-form-control-container">
                                            <div className="payment-method-form-control terms_and_conditions-part">
                                                <p style={{ width: '80%' }}>Acepto los <Link to="/help/information/mod=terms_and_conditions">términos y condiciones</Link> y autorizo el tratamiento de datos personales</p>
                                                <button className="accept-terms_and_conditions-form" style={{ 
                                                    background: !paymentDetails.termsAndConditions ? 'transparent' : '#3282B8',
                                                    border: !paymentDetails.termsAndConditions ? '1px solid #444' : 'transparent'
                                                }} onClick={e => setPaymentDetails({ ...paymentDetails, termsAndConditions: !paymentDetails.termsAndConditions })}></button>
                                            </div>
                                            <div className="payment-method-form-control pay-service-in-post-container">
                                                <p className="field incomplete-form" style={{ width: '100%', textAlign: 'center', background: '#d10b0b', padding: '6px', borderRadius: '8px', color: '#FFFFFF', margin: '2px 0' }}>Rellena todos los datos correctamente.</p>
                                                {sendingTransaction && <p id="sendingTransaction">PROCESANDO TRANSACCION</p>}
                                            </div>
                                            <div className="payment-method-form-control pay-service-in-post-container">
                                                <button className="pay-service-in-post" onClick={() => pay()} hidden={sendingTransaction ? true : false}>{paymentDetails.type !== 'bank' && paymentDetails.type !== 'cash' ? 'Pagar' : 'Generar numero de pago'} <i className="fa-solid fa-arrow-right" style={{ color: '#FFFFFF', margin: "0 5px" }}></i></button>
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <div className="purchase-information-container">
                                <div className="purchase-information">
                                    <div className="purchase-information-title">
                                        <img src="/img/payment_gateway/payu/payu.png" alt="payu"/>
                                        <h2>Resumen de la venta</h2>
                                    </div>
                                    <div className="purchase-information-description">
                                        <p>Descripcion: {product.description}</p>
                                        <p>Correo: {userInformation.email}</p>
                                        <p>Total compra: ________ ${offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value},00 COP</p>
                                        <p>IVA: ${Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) * 0.19)},00 COP</p>
                                        <p>Total a cobrar: ${(offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) + Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amount : product.value) * 0.19)},00 COP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {copied && <span className="copied-span">Copiado</span>}
            {scoreUpdated && <span className="scoreUpdated-span">Voto actualizado</span>}
        </div>
    ) : <div style={{ paddingTop: '40px' }}><Loading margin="auto" /></div>;
};

export default PostInformation;