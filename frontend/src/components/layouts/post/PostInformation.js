import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams } from 'react-router';
import swal from 'sweetalert';

import { getProducts, makeOffer, getOffer, increaseView, reviewBlocked } from '../../../api';
import Loading from '../../parts/Loading';

function PostInformation({ auth, userInformation }) {
    const [offerVerification, setOfferVerification] = useState(null);
    const [offer, setOffer] = useState(null);
    const [product, setProduct] = useState(null);
    const [position, setPosition] = useState(0);

    const { post_id } = useParams();
    const navigate = useNavigate();

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
                if (!result.error) setOfferVerification({ amount: result.amount, acceptOffer: result.acceptOffer });
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
    },[post_id, userInformation, navigate]);

    useEffect(() => {
        const searchProducts = async () => {
            const productObtained = await getProducts({ id: post_id });
            if (productObtained.error) navigate('/')
            else {
                setProduct(productObtained);
                if (auth) { await increaseView(post_id) };
            };
        };
        searchProducts();
    }, [post_id, navigate, auth]);

    const createOffer = async () => {
        document.querySelector('.field-make-offer').classList.remove('showError');
        document.querySelector('.field-make-offer-no-input').classList.remove('showError');
        const value = document.getElementById('make-offer').value;

        if (parseInt(value) === 0 || value === '') return document.querySelector('.field-make-offer-no-input').classList.add('showError');

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

            const result = await makeOffer(data);

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

                setOfferVerification({ amount: parseInt(value), acceptOffer: false  });
            };

        } else document.querySelector('.field-make-offer').classList.add('showError');
    };

    return (
        <div className="post-information-container">
            <div className="post-information">
                <section>
                    <div className="post-information-photos-container">
                        {product !== null && position !== 0 ? <i className="fa-solid fa-circle-arrow-left" id="fa-circle-arrow-left-post-information-photos" onClick={() => setPosition(position - 1)}></i> : <></>}
                        {product !== null
                            ? <div className="post-information-photos" style={{ width: `${product.files.length}00%` }}>
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
                            : <Loading margin="auto" />}
                        {product !== null && position + 1 !== product.files.length ? <i className="fa-solid fa-circle-arrow-right" id="fa-circle-arrow-right-post-information-photos" onClick={() => setPosition(position + 1)}></i> : <></>}
                    </div>
                    <p id="post_id">SEREAL: {product === null ? 'Cargando...' : product._id}</p>
                    {product !== null && product.owner === userInformation._id && product.stateActivated
                        ? <Link className="service-offer-post-information" to={`/post/information/${post_id}/control`}>Panel de control {offer !== null ? <span id="count-offers">{offer.length}</span> : ''}</Link>
                        : <></>}
                </section>
                <section className="post-information-card-container">
                    <div className="post-information-card">
                        {product !== null && !product.stateActivated ? <h1 className="main-post-information-category" style={{ color: '#ff9900', margin: '10px 0' }}><i className="fas fa-history" style={{ color: '#ff9900', fontSize: '35px' }}></i> Este producto se encuentra en revision.</h1> : ''}
                        <h1 className="main-post-information-category">Categoria: <span>{product !== null ? product.category : ''}</span></h1>
                        <h1 className="main-post-information-subcategory">Subcategoria: <span>{product !== null ? product.subCategory : ''}</span></h1>
                        <h1 className="post-information-subcategory">Subcategoria Personalizada: <span>{product !== null ? product.customCategory : ''}</span></h1>
                        <h1 className="post-information-title">Titulo: <span>{product !== null ? product.title : ''}</span></h1>
                        <p className="post-information-description">{product !== null ? product.description : ''}</p>
                    </div>
                    <div className="post-value-container">
                        <div className="value-information-container">
                            <label>Valor del producto</label>
                            <h1 className="post-producto-value">{product !== null ? product.value === null ? 'Negociable' : `${product.value}$` : ''}</h1>
                        </div>
                        <div className="date-and-call-video-container">
                            <h1 className="post-information-date">Fecha: {product !== null ? product.dateOfDelivery === null ? 'Indefinido' : product.dateOfDelivery : ''}</h1>
                            <p className="post-call-video-link">Link de la video llamada: <span>No disponible</span></p>
                        </div>
                    </div>
                    {offerVerification === null && auth && (product !== null && product.owner !== userInformation._id && product.stateActivated)
                        ? <div className="post-send-container">
                            <input type="number" placeholder="Hacer una oferta" id="make-offer" />
                            <button onClick={() => createOffer()}>Enviar</button>
                        </div>
                        :  product !== null && auth && product.owner !== userInformation._id ? <p className="field" style={{ display: 'block', color: '#3282B8', fontSize: '22px' }}>Su oferta de {offerVerification.amount}$ {offerVerification.acceptOffer ? 'ha sido aceptada.' : 'esta en revision'}.</p> : <></>}
                    <p className="field field-make-offer-no-input">Escriba un valor.</p>
                    <p className="field field-make-offer">La oferta no debe tener mas de 10 caracteres.</p>
                    <div style={{ marginTop: '20px' }}>
                        {product !== null
                            ? <Link to={`/${product.creatorUsername}`}><button id="goToProfile">Ir al perfil del creador</button></Link>
                            : <></>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostInformation;