import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { changeDate, verificationOfInformation } from '../../helpers';
import Vote from '../../parts/Vote';
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
    getTransaction,
    vote,
    getVote,
    takePost,
    getUser,
    removeTakePost,
    getTask,
    requestPayment,
    teacherPayment,
    getNotifications,
    removePayment,
    removeOffer,
    acceptOffer
} from '../../../api';
import Loading from '../../parts/Loading';
import Information from '../../parts/Information';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function PostInformation({ auth, userInformation, isTheUserSuspended, setMainProducts, setProducts, setReportUsername, setQuoteId, setReportProductId, setCountInNotification, setNotifications, setCountInMessages, setReportTransaction }) {
    const [activatePayment,setActivatePayment] = useState(false);
    const [offerVerification, setOfferVerification] = useState(null);
    const [offerTeacher,setOfferTeacher] = useState(null);
    const [offer, setOffer] = useState(null);
    const [productFound, setProductFound] = useState(null);
    const [position, setPosition] = useState(0);
    const [copied, setCopied] = useState(false);
    const [sendingTransaction,setSendingTransaction] = useState(false);
    const [banks,setBanks] = useState([]);
    const [loadingGeneral,setLoadingGeneral] = useState(false);
    const [width,setWidth] = useState(window.innerWidth);
    const [score,setScore] = useState(0);
    const [scoreUpdated,setScoreUpdated] = useState(false);
    const [sendingInformation,setSendingInformation] = useState(false);
    const [offerInputNumber,setOfferInputNumber] = useState(0);
    const [offerInputString,setOfferInputString] = useState('');
    const [teacher,setTeacher] = useState(null);
    const [teacherUsername, setTeacherUsername] = useState('');
    const [task,setTask] = useState(null);
    const [activeVote,setActiveVote] = useState(false);
    const [handlerVote,setHandlerVote] = useState(false);
    const [userToVote,setUserToVote] = useState({});
    const [currentVote,setCurrentVote] = useState(null);
    const [sentReportTransaction,setSentReportTransaction] = useState(null);
    const [urlVideoCall,setUrlVideoCall] = useState('');
    const [activateInformation,setActivateInformation] = useState(false);

    const changeWidth = () => setWidth(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', changeWidth);
        return (() => window.removeEventListener('resize', changeWidth));
    });

    useEffect(() => {
        if (productFound !== null && productFound.takenBy) {
            const checkVote = async () => {
                const result = await getUser({ id: productFound.takenBy });
                if (!result.error) setTeacher(result); 
            };  
            checkVote();
        };
    },[productFound,userInformation]);

    useEffect(() => {
        if (productFound !== null && productFound.takenBy) {
            const checkVote = async () => {
                const result = await getVote({ 
                    to: userInformation._id,
                    from: productFound.takenBy,
                    voteType: 'product'
                });
                if (!result.error) setCurrentVote(result); 
            };  
            checkVote();
        };
    },[productFound,userInformation]);

    const [paymentDetails,setPaymentDetails] = useState({
        type: 'select',
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

    const { post_id } = useParams();
    const navigate = useNavigate();

    const closeTimerCopied = useRef();
    const closeTimerScoreUpdated = useRef();
    const eventZone = useRef();
    //const resetVideoCallURL = useRef();
    const voteTimer = useRef();

    const searchNotifications = useCallback(
        async () => {
            const briefNotifications = await getNotifications(cookies.get('id'));

            const currentNotification = [];
            let count = 0;

            for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
            for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

            setCountInNotification(count);
            setNotifications(currentNotification);
        },[setCountInNotification,setNotifications]
    );

    useEffect(() => {
        socket.on('product updated', async ({ product, global }) => {
            if (product._id === post_id) {
                setProductFound(product);
                if (global) {
                    const currentProductsCollections = await getProducts({ blockSearch: userInformation._id });
                    setProducts(currentProductsCollections);
                };
            };
        });

        socket.on('product deleted', ({ finished }) => {
            if (finished) {
                swal({
                    title: 'PAGO ACEPTADO',
                    text: 'El estudiante ha aceptado la solicitud de pago que has hecho !FELICIDADES! la publicacion sera eliminada.',
                    icon: 'success',
                    button: '!Gracias!'
                }).then(() => navigate(`/${teacherUsername}`));
            } else {
                swal({
                    title: 'PUBLICACION ELIMINADA',
                    text: 'La publicacion ha sido eliminada por el estudiante, si crees que has sufrido de estafa, por favor reporta.',
                    icon: 'error',
                    button: 'Ok'
                }).then(() => navigate(`/${teacherUsername}`));
            }
        });

        socket.on('new offer', async ({ productID }) => { 
            if (productID === post_id) {
                const result = await getOffer({ id_product: post_id });
                if (!result.error) setOffer(result);
            };
        });

        socket.on('new_message', () => setCountInMessages(count => count + 1));
        socket.on('received event', async () => await searchNotifications());

        socket.on('offer event', async ({ productID }) => { 
            if (productID === post_id) {
                const result = await getOffer({ id_user: userInformation._id, id_product: post_id });
                if (!result.error) {
                    setOfferVerification(result);
                } else setOfferVerification(null);

                if (productFound.takenBy) {
                    const result = await getOffer({ id_user: productFound.takenBy, id_product: post_id });
                    setOfferTeacher(result);
                };
            };
        });

        return (() => socket.off());
    });

    /*useEffect(() => {
        if (productFound !== null) {
            const checkVote = async () => {
                const result = await getVote({ 
                    from: cookies.get('id'), 
                    to: productFound.owner,
                    productId: productFound._id,
                    voteType: 'product'
                });

                setCurrentVote(result);
            };
            checkVote();
        };
    },[productFound]);*/

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
        if (productFound && userInformation) {
            if (productFound.owner === userInformation._id) {
                const checkTransaction = async () => {
                    const result = await getTransaction({ 
                        checkVerification: userInformation._id,
                        post_id
                    });
                    if (result.error) setSentReportTransaction(true)
                    else setSentReportTransaction(false);
                };
                checkTransaction();
            } else setSentReportTransaction(false);
        };
    },[userInformation,productFound,post_id]);

    useEffect(() => {
        const searchOffers = async () => {
            const result = await getOffer({ id_product: post_id });
            if (!result.error) setOffer(result);
        };
        searchOffers();
    }, [post_id,productFound]);

    useEffect(() => {
        if (auth) {
            const checkOffer = async () => {
                const result = await getOffer({ id_user: userInformation._id, id_product: post_id });
                if (!result.error) setOfferVerification(result);

                if (productFound !== null && productFound.takenBy) {
                    const result = await getOffer({ id_user: productFound.takenBy, id_product: post_id });
                    setOfferTeacher(result);
                };
            };
            checkOffer();
        };
    }, [auth, post_id, userInformation, productFound]);

    useEffect(() => {
        const watchLock = async () => {
            const result = await reviewBlocked({ from: userInformation._id, to: post_id, productFound: true });

            if (result.length > 0) { navigate('/') };
        };
        watchLock();
    }, [post_id, userInformation, navigate]);

    useEffect(() => {
        if (productFound !== null && productFound.takenBy !== null) {
            const checkTask = async () => {
                const taskObtained = await getTask({ from: productFound.takenBy, to: productFound.owner, productId: post_id });
                if (taskObtained === null || taskObtained.length === 0 || taskObtained === '') setTask(false)
                else setTask(taskObtained);
            };
            checkTask();
        } else if (productFound !== null) setTask(false);
    },[productFound,post_id]);

    useEffect(() => {
        const checkProduct = async () => {
            if (productFound !== null && productFound.takenBy !== null) {
                const teacher = await getUser({ id: productFound.takenBy });
                setTeacherUsername(teacher.username);
            };
        };
        checkProduct();
    },[productFound]);

    useEffect(() => {
        const searchProducts = async () => {
            const productObtained = await getProducts({ id: post_id });
            if (productObtained.error || productObtained.length === 0) navigate('/')
            else {
                if (productObtained.takenBy !== null) {
                    const teacher = await getUser({ id: productObtained.takenBy });
                    setTeacherUsername(teacher.username);
                };
                setProductFound(productObtained);
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

    useEffect(() => {
        if (productFound !== null && productFound.takenBy) {
            const searchUserToVote = async () => {
                const user = await getUser({ id: userInformation._id === productFound.owner ? productFound.takenBy : productFound.owner });
                setUserToVote(user);
            };
            searchUserToVote();
        };
    },[productFound, userInformation]);

     const finalize = useCallback(
        async () => {
                if (!currentVote) {
                    await vote({ 
                        from: cookies.get('id'), 
                        to: userInformation._id === productFound.owner ? productFound.takenBy : productFound.owner, 
                        productId: productFound._id, 
                        vote: score
                    });
                };

                if (userInformation._id === productFound.owner) {
                    socket.emit('product deleted', { userID: productFound.takenBy, finished: true });
                    setSendingInformation(true);
                    await teacherPayment({ typeData: 'accept', post_id, user_id: productFound.owner });
                    await removeFiles({ files: productFound.files, activate: true });
                    await deleteProduct({ id: post_id, notification: false, finished: true });
                    socket.emit('received event', productFound.takenBy);
                    setSendingInformation(false);
                    swal({
                        title: '!FELICIDADES!',
                        text: 'Has mandado el pago al profesor satisfactoriamente, la publicacion ha finalizado exitosamente.',
                        icon: 'success',
                        timer: '4000',
                        button: false,
                    }).then(() => navigate('/'));
                } else {
                    setSendingInformation(true);
                    await removeFiles({ files: productFound.files, activate: true });
                    await deleteProduct({ id: post_id, notification: false, finished: true, teacher: true });
                    socket.emit('received event', productFound.owner);
                    setSendingInformation(false);
                    swal({
                        title: 'FINALIZADO',
                        text: 'La publicacion ha sido finalizada correctamente.',
                        icon: 'success',
                        timer: '2000',
                        button: false,
                    }).then(() => navigate('/'));
                };
            },[userInformation,navigate,post_id,productFound,score,currentVote]
    );

    useEffect(() => { if (handlerVote) finalize() },[handlerVote,finalize]);

    const createOffer = async () => {
        document.querySelector('.field-make-offer').classList.remove('showError');
        document.querySelector('.field-make-offer-no-input').classList.remove('showError');

        if (offerInputNumber === '') return document.querySelector('.field-make-offer-no-input').classList.add('showError');

        if (/^[0-9]{0,20}$/.test(offerInputNumber)) {
            const data = {
                mainInformation: {
                    product: post_id,
                    user: userInformation._id,
                    amountNumber: offerInputNumber,
                    amountString: offerInputString,
                    username: userInformation.username,
                    firstName: userInformation.firstName,
                    lastName: userInformation.lastName
                },
                notification: productFound.owner
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
                socket.emit('new offer', { userID: productFound.owner, post_id });
                swal({
                    title: 'Enviado',
                    text: 'Ha sido enviado satisfactoriamente la oferta',
                    icon: 'success',
                    timer: '3000',
                    button: false
                });

                setOfferVerification({ 
                    amountString: offerInputString,
                    amountNumber: offerInputNumber, 
                    acceptOffer: false 
                });
                setOfferInputString('');
                setOfferInputNumber(0);
            };

        } else document.querySelector('.field-make-offer').classList.add('showError');

        socket.emit('received event', productFound.owner);
    };

    /*const changeURL = () => {
        swal({
            title: '¿Estas seguro?',
            text: '¿Quieres cambiar el link de la videollamada?.',
            icon: 'warning',
            buttons: ['Rechazar', 'Aceptar']
        }).then(async res => {
            if (res) {
                resetVideoCallURL.current.style.display = 'none';
                const productUpdated = await changeVideoCallURL({ post_id });
                setProductFound(productUpdated);
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
    };*/

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
                ownerId: productFound.owner,
                userID: cookies.get('id'),
                name: productFound.title,
                description: productFound.description,
                userEmail: userInformation.email,
                category: productFound.category,
                customCategory: productFound.customCategory,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber,
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
                    text: `TRANSACCION REALIZADA CORRECTAMENTE, MONTO PAGADO: $${offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber} IVA: $${Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) * 0.19)}, TOTAL: $${(offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) + Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) * 0.19)}`,
                    icon: 'success',
                    button: '!Gracias!',
                });

                setActivatePayment(false);
                setOfferVerification({
                    ...offerVerification,
                    amount: offerVerification.amountNumber ? offerVerification.amountNumber : productFound.valueNumber,
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
                name: productFound.title,
                description: productFound.description,
                userEmail: userInformation.email,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber,
                bank: paymentDetails.bank,
                nameOfOwner: paymentDetails.name,
                personType: paymentDetails.personType,
                RESPONSE_URL: `/post/information/${post_id}/transaction/receipt`,
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
                name: productFound.title,
                description: productFound.description,
                userEmail: userInformation.email,
                amount: offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber,
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
                const takenBy = productFound.takenBy;
                eventZone.current.style.display = 'none';
                await removeFiles({ files: productFound.files, activate: true });
                await deleteProduct({ id: post_id, notification: false });
                socket.emit('received event', takenBy);
                socket.emit('product deleted', { userID: productFound.takenBy, finished: false });
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
                to: productFound.owner, 
                productId: productFound._id, 
                vote: currentVote === score ? 0 : currentVote 
            });

            setScoreUpdated(true);
        },1400);
    };

    const engage = () => {
        swal({
            title: '¿Quieres postular a la publicacion?',
            text: '¿Te comprometes a culminar la publicación en el tiempo solicitado, teniendo en cuenta la calidad del trabajo? de eso dependerá su experiencia y su calificacion, para que más estudiantes lo recomienden.',
            icon: 'warning',
            buttons: ['No estoy seguro', 'Me compromento']
        }).then(async res => {
            if (res) {
                setSendingInformation(true);
                const result = await takePost({ post_id, teacher_id: cookies.get('id') });
                setSendingInformation(false);

                if (result.error) {
                    if (result.type === 'this post has been taken') {
                        swal({
                            title: 'ERROR',
                            text: 'La publicacion ya lo tomo un profesor',
                            icon: 'error',
                            button: 'ok',
                        });
                        setProductFound(result.productFound);
                    };
                    if (result.type === 'maximum products taken') {
                        swal({
                            title: 'ERROR',
                            text: `
                                Alcanzaste el limite de publicaciones, resuelve las publicaciones que 
                                seleccionaste para poder tomar una publicacion.
                            `,
                            icon: 'error',
                            button: 'ok',
                        });
                    }
                } else {
                    socket.emit('received event', productFound.owner);
                    socket.emit('product updated', { userID: productFound.owner, post_id, globalProductUpdate: true });
                    swal({
                        title: '!EXITO!',
                        text: `Excelente te has comprometido con la publicacion.`,
                        icon: 'success',
                        button: '!Gracias!',
                    });
                    setProductFound(result);
                };
                const newProductsCollection = await getProducts({ blockSearch: userInformation._id });
                setProducts(newProductsCollection);
            };
        });
    };

    const removeTake = () => {
         swal({
            title: userInformation._id === productFound.owner ? '¿Quieres expulsar al profesor?' : '¿Quieres renunciar?',
            text: userInformation._id === productFound.owner ? `Recuerda que puedes sacar al profesor si no se comunica con usted, o por algun inconveniente que hayan tenido, no saques a profesores sin ningun motivo porque podria llevar a la suspencion de su cuenta.` : `Puedes renunciar a la publicacion cuando quieras, pero por favor no lo hagas el mismo dia de la entrega, porque podria llevar a la suspencion de su cuenta, y ser reportado a nuestro moderadores.`,
            icon: 'warning',
            buttons: ['Mejor no', 'Estoy seguro']
        }).then(async res => {
            if (res) {
                const teacher = productFound.takenBy;
                setSendingInformation(true);
                const result = await removeTakePost({ 
                    post_id, 
                    typeOfUser: userInformation._id === productFound.owner ? 'students' : 'teacher', 
                    user_id: userInformation._id 
                });
                setOfferTeacher(null);
                setSendingInformation(false);
                
                if (result.error) {
                    swal({
                        title: 'ERROR',
                        text: userInformation._id === productFound.owner ? 'El profesor ya renuncio.' : 'El estudiante de la publicacion ya te expulso.',
                        icon: 'error',
                        button: 'ok',
                    });
                    setProductFound(result.product);
                } else {
                    socket.emit('received event', userInformation._id === productFound.owner ? teacher : productFound.owner);
                    socket.emit('product updated', { userID: userInformation._id === productFound.owner ? teacher : productFound.owner, product: result, globalProductUpdate: true });
                    swal({
                        title: '!EXITO!',
                        text: userInformation._id === productFound.owner ? `
                            Has expulsado al profesor, tu publicacion ha sido reposteada.
                        ` : `
                            Has renunciado a la publicacion satisfactoriamente.
                        `,
                        icon: 'success',
                        button: '!Gracias!',
                    });
                    setProductFound(result);
                };
                const newProductsCollection = await getProducts({ blockSearch: userInformation._id });
                setProducts(newProductsCollection);
            };
        });
    };

    const requestPay = async () => {
        if (productFound.advancePayment) {
            setSendingInformation(true);
            const result = await requestPayment({ post_id, teacher_id: productFound.takenBy });
            setSendingInformation(false);
            socket.emit('received event', productFound.owner);
            socket.emit('product updated', { userID: productFound.owner, post_id });
            setProductFound(result);
            swal({
                title: '!EXITO!',
                text: `Se ha enviado la peticion de pago con exito, recuerda que el estudiante tiene un maximo de 8 dias para reportarse de lo contrario la tarea se da por terminada, y su pago estara pendiente por realizar, espere la respuesta del estudiante.`,
                icon: 'success',
                button: '!Gracias!',
            });
        } else {
            swal({
                title: 'ATENCION',
                text: 'Esta publicacion no tiene verificado el pago por medio de PENSSUM, debes llegar a un acuerdo con el estudiante con respecto al pago.',
                icon: 'info',
                button: 'Ok',
            }).then(() => {
                swal({
                    title: `ESCRIBE EL MENSAJE PARA ${teacher.firstName ? teacher.firstName : teacher.secondName ? teacher.secondName : teacherUsername}`,
                    content: {
                        element: "input",
                        attributes: {
                          placeholder: "Mensaje",
                          type: "text",
                        },
                    },
                    button: 'Enviar'
                }).then((value) => {
                    if (value === null) return 

                    if (value) {
                        socket.emit('send_message', productFound.takenBy, productFound.owner, value);
                        socket.emit('received event', productFound.owner);
                        swal({
                            title: 'Enviado',
                            text: 'Mensaje enviado con exito',
                            icon: 'success',
                            timer: '2000',
                            button: false,
                        }).then(() => navigate('/messages'));
                    };
                });
            });
        };
    };

    const sendPayToTeacher = () => {
        swal({
            title: '¿Ya han terminado con la publicacion?',
            text: 'Si han terminado la publicacion se eliminara de penssum y se enviara el pago al profesor por el servicio dado.',
            icon: 'info',
            buttons: ['No hemos terminado', 'Hemos terminado']
        }).then(async res => {
            if (res) {
                if (!currentVote) setActiveVote(true)
                else finalize();
            };
        });
    };

    const doNotSendPayment = (why) => {
        swal({
            title: 'ATENCION',
            text: userInformation.objetive === 'Alumno' ? 'Antes de negar el pago por favor explica porque no quieres hacer la transaccion, y que es lo que falta para que la transaccion se realize.' : 'Antes de no aceptar la finalizacion de la publicacion por favor explica porque no quieres, se por favor respetuoso y trata como te gustaria que te tratara.',
            icon: 'info',
            buttons: ['Cancelar','Ok']
        }).then((res) => {
            if (res) {
                swal({
                    title: `ESCRIBE EL MENSAJE PARA ${userInformation === 'Alumno' ? teacher.firstName ? teacher.firstName : teacher.secondName ? teacher.secondName : teacherUsername : 'EL ALUMNO'}`,
                    content: {
                        element: "input",
                        attributes: {
                          placeholder: "Mensaje",
                          type: "text",
                        },
                    },
                    button: 'Enviar'
                }).then(async (value) => {
                    if (value === null) return 

                    if (value) {
                        setSendingInformation(true);
                        const result = await teacherPayment({ typeData: 'declined', post_id, user_id: userInformation.objetive === 'Alumno' ? productFound.owner : productFound.takenBy, why });
                        socket.emit('send_message', userInformation.objetive === 'Alumno' ? productFound.owner : productFound.takenBy, userInformation.objetive === 'Alumno' ? productFound.takenBy : productFound.owner, value);
                        socket.emit('received event', userInformation.objetive === 'Alumno' ? productFound.takenBy : productFound.owner);
                        socket.emit('product updated', { userID: userInformation.objetive === 'Alumno' ? productFound.takenBy : productFound.owner, post_id });
                        setProductFound(result);
                        setSendingInformation(false);
                        swal({
                            title: 'Enviado',
                            text: 'Mensaje enviado con exito',
                            icon: 'success',
                            timer: '2000',
                            button: false,
                        });
                    };
                });
            }
        });
    };

    const finalizedPublicaction = () => {
        swal({
            title: '¿YA TE PAGARON?',
            text: 'Si ya te pagaron puedes finalizar la publicacion y darlo por hecho, si no te han pagado y estas sufriendo de estafa por favor reportelo, si esta en espera no de por finalizado la publicacion.',
            icon: 'info',
            buttons: ['Cancelar','Si']
        }).then(async res => {
            if (res) {
                if (!currentVote) setActiveVote(true)
                else finalize();
            }
        });
    };

    const checkAuth = () => {
        swal({
            title: 'No estas registrado',
            text: 'Para hacer uso de este evento necesita tener una cuenta como PROFESOR ¿quieres crear una cuenta?',
            icon: 'info',
            buttons: ['No', 'Si']
        }).then(res => res && navigate("/signup"));
    };

    const deletePayment = () => {
        swal({
            title: '¿Quieres eliminar el pago?',
            text: 'Si no pagas no tendras la verificacion de pago por medio de nuestra platafoma y tendras que llegar a un acuerdo con el profesor respecto al pago.',
            icon: 'warning',
            buttons: ['No estoy seguro','Estoy seguro']
        }).then(async res => {
            if (res) {
                setSendingInformation(true);
                const productUpdated = await removePayment({ post_id });
                setProductFound(productUpdated);
                setSendingInformation(false);
                swal({
                    title: '!ELIMINADO!',
                    text: 'Se ha eliminado el pago pendiente por realizar',
                    icon: 'success',
                    timer: '2000',
                    button: false,
                });
            };
        });
    };

    const removeCounterOffer = () => {
        swal({
            title: '¿Estas seguro?',
            text: '¿No quieres aceptar la contraoferta?',
            icon: 'warning',
            buttons: ['Espera', 'Correcto']
        }).then(async res => {
            if (res) {
                setSendingInformation(true);
                await removeOffer({ id_user: userInformation._id, id_product: post_id, notification: false, from: userInformation._id });
                setOfferVerification(null);
                setSendingInformation(false);

                swal({
                    title: '!EXITO!',
                    text: `La contraoferta ha sido cancelada`,
                    icon: 'success',
                    timer: '3000',
                    button: false,
                });
            };
        });
    };

    const acceptCounterOffer = () => {
        swal({
            title: '¿Quieres aceptar la contraoferta?',
            text: 'Si aceptas la contraoferta podrás obtener la publicación por el precio que acordaron',
            icon: 'info',
            buttons: ['No', 'Si']
        }).then(async res => {
            if (res) {
                setSendingInformation(true);
                const result = await acceptOffer({ id_user: userInformation._id, id_product: post_id });
                setOfferVerification(result.offer);
                setSendingInformation(false);

                if (!productFound.advancePayment) {
                    socket.emit('send_message',productFound.owner, userInformation._id, `
                        Hola soy el dueño del servicio ${productFound.title}, me parece bien la oferta propuesta de ${offerVerification.amountNumber === 0 ? 'Gratis' : `$${offerVerification.amountString}`} me gustaría
                        llegar a un acuerdo con usted de como se haría realidad la implementación del servicio propuesto.
                    `);
                };

                swal({
                    title: 'EXITO',
                    text: '!Has aceptado la oferta satisfactoriamente!',
                    icon: 'success',
                    button: true,
                });
            };
        });
    };

    return productFound !== null && task !== null && sentReportTransaction !== null ? (
        <div className="post-information-container">
            {loadingGeneral && <Loading 
                center={true}
                background={true} 
                optionText={{
                    text: "...BUSCANDO BANCOS ACTIVOS...", 
                    colorText: "#FFFFFF",
                    fontSize: '26px'
            }}/>}
            {activeVote && <Vote required={true} setActiveVote={setActiveVote} setHandlerVote={setHandlerVote} setVote={setScore} postInformation={true} userToVote={userToVote}/>}
            <div className="post-information">
                <section>
                    <div className="post-information-photos-container">
                        {position !== 0 ? <i className="fa-solid fa-circle-arrow-left" id="fa-circle-arrow-left-post-information-photos" onClick={() => setPosition(position - 1)}></i> : <></>}
                        <div className="post-information-photos" style={{ width: `${productFound.files.length}00%` }}>
                            {productFound.files.map(file => {
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
                        {position + 1 !== productFound.files.length ? <i className="fa-solid fa-circle-arrow-right" id="fa-circle-arrow-right-post-information-photos" onClick={() => setPosition(position + 1)}></i> : <></>}
                    </div>
                    <p id="post_id">ID: {productFound === null ? 'Cargando...' : productFound._id}</p>
                    {productFound.owner === userInformation._id && productFound.stateActivated
                        ? <Link className="service-offer-post-information" to={`/post/information/${post_id}/control`}>Panel de control {offer !== null ? <span id="count-offers">{offer.length}</span> : ''}</Link>
                        : <></>}
                </section>
                <section className="post-information-card-container">
                    <div className="post-information-card">
                        {!productFound.stateActivated ? <h1 style={{ color: '#ff9900', margin: '10px 0' }}><i className="fas fa-history" style={{ color: '#ff9900', fontSize: '35px' }}></i> Este producto se encuentra en revision.</h1> : ''}
                        {productFound.owner === userInformation._id && (productFound.paymentType === "PSE" || productFound.paymentType === "cash" || productFound.paymentType === "bank") && !productFound.advancePayment && ( 
                            <h1 style={{ color: '#ff9900' }}>PAGO PENDIENTE 
                                {!sendingInformation && (
                                    <a 
                                        disabled={sendingInformation}
                                        href={productFound.paymentLink} 
                                        target="_BLANK" 
                                        rel="noreferrer" 
                                        title={productFound.paymentType === "cash" || productFound.paymentType === "bank" ? "Recibo" : "Finalizar pago"}
                                        ><i 
                                            className="fa-solid fa-flag-checkered" 
                                            id="fa-flag-checkered"
                                        ></i>
                                    </a> 
                                )}
                                <i 
                                    className="fa-solid fa-trash" 
                                    id="fa-trash" 
                                    title="Eliminar pago" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => { if (!sendingInformation) deletePayment() }}>
                                </i>
                            </h1>
                        )}
                        {productFound.advancePayment && <h1 className="main-post-information-payment"><img src="/img/penssum-transparent.png" alt="icon-logo"/><span>PAGO VERIFICADO</span> <i className="fa fa-check" style={{ fontSize: '40px', color: '#3282B8' }}></i></h1>}
                        {productFound.owner === userInformation._id && (
                            <div className="main-post-information" ref={eventZone}>
                                <h1 className="main-post-information-category">{/*Categoria: */}<span>{productFound.category}</span></h1>
                                {task === false && <button title="Borrar producto" id="delete-product" onClick={() => removeProduct()}><i className="fa-solid fa-trash-can"></i></button>}
                            </div>
                        )}
                        <h1 className="main-post-information-subcategory">{/*Subcategoria: */}<span>{productFound.subCategory}</span></h1>
                        <h1 className="post-information-subcategory">{/*Categoria personalizada: */}<span>{productFound.customCategory}</span></h1>
                        <h1 className="post-information-title">Tema: <span>{productFound.title}</span></h1>
                        <p className="post-information-description">{productFound.description}</p>
                    </div>
                    <div className="post-value-container">
                        <div className="value-information-container">
                            <label>Valor del producto</label>
                            <h1 className="post-producto-value">{offerVerification !== null && offerVerification.acceptOffer ? `$${offerVerification.amountString}` : offerTeacher !== null && offerTeacher.acceptOffer ? `$${offerTeacher.amountString}` : productFound.valueNumber === 0 ? 'Negociable' : `$${productFound.valueString}`}</h1>
                            {(auth && productFound.stateActivated && ((productFound.advancePayment && productFound.owner === userInformation._id) || (!productFound.advancePayment && productFound.takenBy === userInformation._id))  && task !== false && productFound.paymentRequest.active === true) && (
                                <div className="accordance-post-information-container">
                                    <h2>¿Estas conforme?</h2>
                                    <p>{userInformation.objetive === "Alumno" ? '¿Quieres enviarle el pago al profesor?' : 'Quieres dar por finalizado la publicacion?'}</p>
                                    <div className="accordance-post-information">
                                        <button 
                                            style={{ 
                                                background: sendingInformation ? '#3282B8' : '', 
                                                opacity: sendingInformation ? '.4' : '', 
                                                cursor: sendingInformation ? 'not-allowed' : '' 
                                            }}
                                            id="accordance-yes" 
                                            onClick={() => { if (!sendingInformation) userInformation.objetive === 'Alumno' ? sendPayToTeacher() : finalizedPublicaction() }}>Si</button>
                                        <button 
                                            style={{ 
                                                background: sendingInformation ? '#3282B8' : '', 
                                                opacity: sendingInformation ? '.4' : '', 
                                                cursor: sendingInformation ? 'not-allowed' : '' 
                                            }}
                                            id="accordance-lack" 
                                            onClick={() => { if (!sendingInformation) doNotSendPayment('Falta de informacion') }}>Aun falta</button>
                                        <button 
                                            style={{ 
                                                background: sendingInformation ? '#3282B8' : '', 
                                                opacity: sendingInformation ? '.4' : '', 
                                                cursor: sendingInformation ? 'not-allowed' : '' 
                                            }}
                                            id="accordance-no" 
                                            onClick={() => { if (!sendingInformation) doNotSendPayment('Rechazado') }}>No</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="date-and-call-video-container">
                            <h1 className="post-information-date">Fecha: {productFound.dateOfDelivery === null ? 'Indefinido' : changeDate(productFound.dateOfDelivery)}</h1>
                            {productFound.owner === userInformation._id && (productFound.paymentType === "cash" || productFound.paymentType === "bank") && !productFound.advancePayment && sentReportTransaction && (
                                <button 
                                    className="post-information-check-payment" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => { 
                                        if (!sendingInformation) {
                                            navigate('/report')
                                            setReportProductId(post_id);
                                            setReportTransaction(true);
                                        };
                                    }}
                                >Comprobar pago</button>
                            )}

                            {(productFound.stateActivated && productFound.owner !== userInformation._id && (offerVerification === null || offerVerification.acceptOffer)  && (userInformation.objetive === 'Profesor' || !auth) && productFound.takenBy === null && (productFound.valueNumber > 0 || (offerVerification !== null && productFound.valueNumber === 0))) && <button 
                                className="post-information-apply" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                                onClick={() => { if (!sendingInformation) auth ? verificationOfInformation(userInformation.objetive,userInformation) ? setActivateInformation(true) : navigate("/complete/information") : checkAuth() }}>Postularse</button>}

                            {(auth && productFound.stateActivated && productFound.takenBy === userInformation._id && task !== false && productFound.paymentRequest.active === false) && <button 
                                className="post-information-give-up" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                                onClick={() => { if (!sendingInformation) requestPay() }}>Solicitar pago</button>}

                            {(auth && productFound.stateActivated && !productFound.advancePayment && productFound.owner === userInformation._id && task !== false && !productFound.advancePayment) && productFound.paymentRequest.active === false && <button 
                                className="post-information-finished" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                                onClick={async () => {
                                    setSendingInformation(true);
                                    const result = await requestPayment({ post_id, teacher_id: productFound.owner });
                                    setSendingInformation(false);
                                    socket.emit('received event', productFound.takenBy);
                                    socket.emit('product updated', { userID: productFound.takenBy, post_id });
                                    setProductFound(result);
                                    swal({
                                        title: '!EXITO!',
                                        text: `Se ha enviado la peticion de finalizacion de la publicacion, espere la respuesta del profesor.`,
                                        icon: 'success',
                                        button: '!Gracias!',
                                    });
                                }}>Finalizado</button>}
                            
                            {(auth && productFound.stateActivated && productFound.takenBy !== null && (productFound.takenBy === userInformation._id || productFound.owner === userInformation._id)) && (
                                <div className="post-information-remove-take-button-container">
                                    <i 
                                        className="fa-solid fa-flag" 
                                        id="report-teacher-post-information" 
                                        title={productFound.takenBy !== userInformation._id ? "Reportar profesor" : "Reportar alumno"}
                                        style={{ 
                                            width: task === false ? '' : '100%',
                                            background: sendingInformation ? '#3282B8' : '', 
                                            opacity: sendingInformation ? '.4' : '', 
                                            cursor: sendingInformation ? 'not-allowed' : ''
                                        }}
                                        onClick={() => {
                                            if (!sendingInformation) {
                                                setReportUsername(productFound.takenBy !== userInformation._id ? teacherUsername : productFound.creatorUsername);
                                                setReportProductId(post_id);
                                                navigate('/report');
                                            }
                                        }}></i>
                                    {(task === false || productFound.takenBy === userInformation._id) && <button 
                                        className="post-information-give-up" 
                                        style={{ 
                                            background: sendingInformation ? '#3282B8' : '', 
                                            opacity: sendingInformation ? '.4' : '', 
                                            cursor: sendingInformation ? 'not-allowed' : '' 
                                        }}
                                        onClick={() => { if (!sendingInformation) removeTake() }}>{productFound.takenBy === userInformation._id ? 'Renunciar' : 'Expulsar profesor'}</button>}
                                </div>
                            )}

                            {(auth && productFound.stateActivated && productFound.takenBy !== null && productFound.takenBy === userInformation._id) && <button 
                                className="post-information-activity" 
                                style={{ 
                                    background: sendingInformation ? '#3282B8' : '', 
                                    opacity: sendingInformation ? '.4' : '', 
                                    cursor: sendingInformation ? 'not-allowed' : '' 
                                }}
                                onClick={() => {
                                    if (!sendingInformation) {
                                        setQuoteId(post_id);
                                        navigate('/send/quote');
                                    }
                                }}>Enviar actividad</button>}
                            
                            {productFound.owner === userInformation._id && (
                                <div className="add-video_call-link-container">
                                    <p>¿Quiere integrar una videollamada externa?</p>
                                    <div className="add-video_call-link">
                                        <input 
                                            type="url" 
                                            placeholder="Agrega el link de la videollamada" 
                                            style={{ width: productFound.videoCall ? '' : '100%' }}
                                            value={urlVideoCall} 
                                            onChange={e => setUrlVideoCall(e.target.value)}/>
                                        <button 
                                            style={{ 
                                                background: sendingInformation ? '#3282B8' : '', 
                                                opacity: sendingInformation ? '.4' : '', 
                                                cursor: sendingInformation ? 'not-allowed' : '',
                                                borderRadius: productFound.videoCall ? '' : '8px'
                                            }}
                                            onClick={async () => {
                                                if (!sendingInformation && /^(ftp|http|https):\/\/[^ "]+$/.test(urlVideoCall)) {
                                                    const productUpdated = await changeVideoCallURL({ post_id, url: urlVideoCall });
                                                    setProductFound(productUpdated);
                                                    swal({
                                                        title: '!Cambiado con exito!',
                                                        text: `La nueva url es ${productUpdated.videoCall}.`,
                                                        icon: 'success',
                                                        timer: '3000',
                                                        button: false,
                                                    });
                                                    socket.emit('product updated', { userID: productFound.takenBy, post_id });
                                                    setUrlVideoCall('');
                                                } else {
                                                    swal({
                                                        title: '!OOPS!',
                                                        text: `Necesita ingresar una url valida.`,
                                                        icon: 'info',
                                                        button: "Gracias",
                                                    });
                                                };
                                            }}
                                        >Guardar</button>
                                        {productFound.videoCall && (
                                            <button 
                                                style={{ 
                                                    background: sendingInformation ? '#3282B8' : '', 
                                                    opacity: sendingInformation ? '.4' : '', 
                                                    cursor: sendingInformation ? 'not-allowed' : ''
                                                }}
                                                id="delete-url-videoCall"
                                                onClick={() => {
                                                    if (!sendingInformation) {
                                                        swal({
                                                            title: '¿Estas seguro?',
                                                            text: '¿Quieres eliminar la Link de la videollamada?.',
                                                            icon: 'warning',
                                                            buttons: ['No', 'Si']
                                                        }).then(async res => {
                                                            if (res) {
                                                                const productUpdated = await changeVideoCallURL({ post_id, remove: true });
                                                                setProductFound(productUpdated);
                                                                swal({
                                                                    title: '!EXITO!',
                                                                    text: `La url ha sido eliminado correctamente`,
                                                                    icon: 'success',
                                                                    timer: '3000',
                                                                    button: false,
                                                                });
                                                                socket.emit('product updated', { userID: productFound.takenBy, post_id });
                                                            };
                                                        });
                                                    };
                                                }}
                                            >Remover</button>
                                        )}
                                    </div>
                                </div>
                            )}
                            {auth && productFound.stateActivated && ((offerVerification !== null && offerVerification.acceptOffer && offerVerification.isThePayment) || (productFound.owner === userInformation._id) || (productFound.takenBy === userInformation._id)) && productFound.videoCall && (
                                <div className="post-video_call-zone">
                                    <p className="post-call-video-link">Link de la videollamada:</p>
                                    <div className="post-video_call-link-container">
                                        <a href={productFound.videoCall} target="_BLANK" rel="noreferrer" className="post-video_call-link">{productFound.videoCall.length > 20 ? productFound.videoCall.slice(0,22) + '...' : productFound.videoCall}</a>
                                        {/*<Link className="post-video_call-link" to={`/video_call/meeting/${productFound.videoCall}`}>{productFound.videoCall}</Link>*/}
                                        <div className="option-post-video_call">
                                            <CopyToClipboard 
                                                text={`${/*process.env.REACT_APP_FRONTEND_PENSSUM}/video_call/meeting/${productFound.videoCall*/productFound.videoCall}`} 
                                                onCopy={() => setCopied(true)}>
                                                <i className="fa-solid fa-copy" title="Copiar"></i>
                                            </CopyToClipboard>
                                            {/*productFound.owner === userInformation._id && <i className="fa-solid fa-arrow-rotate-left" title="Cambiar URL" ref={resetVideoCallURL} onClick={() => changeURL()}></i>*/}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {((offerVerification === null && productFound.valueString !== null) || (offerVerification !== null && !offerVerification.isThePayment && !offerVerification.isBought && offerVerification.acceptOffer)) && auth && productFound.owner !== userInformation._id && productFound.stateActivated && productFound.paymentMethod && (
                        <div className="pay-method-post">
                            <p className="pay-method-post-title">Metodo de pago del servicio.</p>
                            <section className="pay-options-post" onClick={() => { setActivatePayment(true); setPaymentDetails({ ...paymentDetails, type: 'select' }) }}><img src="/img/payu.png" alt="payu"/></section>
                        </div>
                    )}
                    {offerVerification !== null && offerVerification.isThePayment && (productFound.owner !== userInformation._id) && (
                        <div className="vote-in-post-container">
                            <h1>Puntuar a {productFound.creatorUsername}</h1>
                            <div className="vote-in-post">
                                <i className="fas fa-star" style={{ color: score === 5 ? '#fe7' : '',  textShadow: score === 5 ? '0 0 20px #952' : '' }} onClick={() => voteUser(5)}></i>
                                <i className="fas fa-star" style={{ color: score === 4 || score === 5 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(4)}></i>
                                <i className="fas fa-star" style={{ color: score === 3 || score === 5 || score === 4 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(3)}></i>
                                <i className="fas fa-star" style={{ color: score === 2 || score === 5 || score === 4 || score === 3 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(2)}></i>
                                <i className="fas fa-star" style={{ color: score === 1 || score === 5 || score === 4 || score === 3 || score === 2 ? score !== 5 ? '#fbff00' : '#fe7' : '', textShadow: score === 5 ? '0 0 20px #952' : ''  }} onClick={() => voteUser(1)}></i>
                            </div>
                        </div>
                    )}
                    {(auth && productFound.stateActivated && productFound.takenBy !== null && task !== false && (productFound.takenBy === userInformation._id || userInformation._id === productFound.owner)) 
                        && <div className="activity-pictures-post-information-container">
                            <h1>Actividad enviada</h1>
                            <div className="activity-pictures-post-information">
                                {task.files.map(file => (
                                    <a href={file.url} rel="noreferrer" target="_blank" key={file.uniqueId}>
                                        <img src={
                                            (file.extname === '.pdf')
                                                ? '/img/pdf_image.svg'
                                                : (file.extname === '.doc' || file.extname === '.docx')
                                                    ? '/img/word_image.svg'
                                                    : (file.extname === '.epub' || file.extname === '.azw' || file.extname === '.ibook')
                                                        ? '/img/document_image.svg'
                                                        : file.url
                                        }
                                            referrerPolicy="no-referrer"
                                            alt="selected_image"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>}
                    {productFound.takenBy !== null && teacher !== null &&
                        <p 
                            className="field" 
                            style={{ 
                                display: 'block', 
                                color: '#3282B8', 
                                fontSize: '22px', 
                                margin: '20px auto', 
                                textAlign: 'center' 
                            }}>
                            Publicacion tomado por un profesor <Link 
                                style={{ color: '#3282B8' }} 
                                to={`/${teacherUsername}`}
                            >{teacher.firstName ? teacher.firstName : teacher.secondName ? teacher.firstName : teacherUsername }</Link>
                        </p>}
                    {(offerVerification !== null && offerVerification.counterOffer) && (
                        <div className="counter-offer-container">
                            <p>El estudiante de la publicacion ha creado una contraoferta.</p>
                            <div className="counter-offer-button-container">
                                <button 
                                    id="accept-counter-offer" 
                                    title="Aceptar contraoferta" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => { if (!sendingInformation) acceptCounterOffer() 
                                }}>CONTRAOFERTA ${offerVerification.amountString}</button>
                                <button 
                                    id="remove-counter-offer" 
                                    title="Negar contraoferta" 
                                    style={{ 
                                        background: sendingInformation ? '#3282B8' : '', 
                                        opacity: sendingInformation ? '.4' : '', 
                                        cursor: sendingInformation ? 'not-allowed' : '' 
                                    }}
                                    onClick={() => { if (!sendingInformation) removeCounterOffer() }}>X</button>
                            </div>
                        </div>
                    )}
                    {(userInformation.objetive === 'Profesor' || !auth) ? 
                        offerVerification === null && productFound.takenBy === null && (productFound.owner !== userInformation._id && productFound.stateActivated)
                            ? !isTheUserSuspended ? (
                                <section className="post-send-offer-container">
                                    <p>¿No estas de acuerdo con el precio?</p>
                                    <div className="post-send-container">
                                        <input type="text" value={offerInputString} placeholder="Has una oferta" id="make-offer" onChange={e => {
                                            document.querySelector('.field-make-offer').classList.remove('showError');
                                            document.querySelector('.field-make-offer-no-input').classList.remove('showError');
                                            var num = e.target.value.replace(/\./g,'');
                                            if(!isNaN(num)){
                                                setOfferInputNumber(parseInt(e.target.value.replace(/\./g, '')));
                                                num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
                                                num = num.split('').reverse().join('').replace(/^[.]/,'');
                                                setOfferInputString(num);
                                            } else setOfferInputString(e.target.value.replace(/[^\d.]*/g,''));
                                        }}/>
                                        <button
                                            style={{ 
                                                background: sendingInformation ? '#3282B8' : '', 
                                                opacity: sendingInformation ? '.4' : '', 
                                                cursor: sendingInformation ? 'not-allowed' : '' 
                                            }}  
                                            onClick={() => { if (!sendingInformation) auth ? verificationOfInformation(userInformation.objetive,userInformation) ? createOffer() : navigate("/complete/information") : checkAuth() }}
                                        >Enviar</button>
                                    </div>  
                                </section>
                            ) : <p className="youAreSuspended">Estas suspendido, no puedes hacer una oferta</p>
                            : auth && productFound.owner !== userInformation._id && productFound.takenBy === null && userInformation.objetive !== 'Alumno' && <p className="field" style={{ display: 'block', color: '#3282B8', fontSize: '22px', margin: '20px auto', textAlign: 'center' }}>{
                                    offerVerification.isBought && offerVerification.isThePayment 
                                        ? `Compraste este servicio por $${offerVerification.amountString}` 
                                        : !offerVerification.counterOffer 
                                            ? `Su oferta ${offerVerification.amountNumber !== 0 ? `de $${offerVerification.amountString}` : 'GRATIS'} ${offerVerification.acceptOffer 
                                                ? `ha sido aceptada${/*!offerVerification.isThePayment ? ', Por favor page el servicio' : ''*/''}`
                                                : 'esta en revision'
                                            }`
                                        : ''
                                    }
                                </p>
                        : <></>}
                    {productFound.owner === userInformation._id && (productFound.paymentType === "cash" || productFound.paymentType === "bank") && !productFound.advancePayment && !sentReportTransaction && <p className="verificationOfPaymentSent">Comprobante de pago enviado, espera a que los moderadores revisén su reporte de transacción.</p>}
                    <p className="field field-make-offer-no-input">Escriba un valor.</p>
                    <p className="field field-make-offer">La oferta no debe tener mas de 10 caracteres.</p>
                    <div style={{ marginTop: '20px' }}>
                        <Link to={`/${productFound.creatorUsername}`} style={{ textDecoration: 'none' }}><button id="goToProfile">Ir al perfil del creador</button></Link>
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
                                            {productFound.valueNumber >= 20000 && paymentDetails.type !== 'cash' && <img src="/img/payment_gateway/payu/cash/Efecty.png" alt="Efecty" style={{ boxShadow: paymentDetails.type === 'cash' ? '0px 6px 12px #3282B8aa' : '' }} onClick={() => setPaymentDetails({ ...paymentDetails, type: 'cash' })}/>}
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
                                        <p>Descripcion: {productFound.description}</p>
                                        <p>Correo: {userInformation.email}</p>
                                        <p>Total compra: ________ ${offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber},00 COP</p>
                                        <p>IVA: ${Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) * 0.19)},00 COP</p>
                                        <p>Total a cobrar: ${(offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) + Math.round((offerVerification !== null && offerVerification.acceptOffer ? offerVerification.amountNumber : productFound.valueNumber) * 0.19)},00 COP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {copied && <span className="copied-span">Copiado</span>}
            {scoreUpdated && <span className="scoreUpdated-span">Voto actualizado</span>}
            {activateInformation && (
                <Information 
                    userInformation={userInformation}
                    callback={engage}
                    controller={setActivateInformation}
                />
            )}
        </div>
    ) : <div style={{ paddingTop: '40px' }}><Loading margin="auto" /></div>;
};

export default PostInformation;