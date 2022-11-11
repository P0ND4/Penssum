import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import OfferCard from "../../parts/post/OfferCard";
import { getProducts, getOffer, socket, getNotifications } from "../../../api";
import Loading from '../../parts/Loading';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function PostControl({ userInformation, setCountInMessages, setCountInNotification, setNotifications }) {
    const [offers, setOffers] = useState(null);
    const [product, setProduct] = useState(null);
    const [activatePayment,setActivatePayment] = useState(false);

    const { post_id } = useParams();
    const navigate = useNavigate();

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
        socket.on('new offer', async ({ productID }) => { 
            if (productID === post_id) {
                const result = await getOffer({ id_product: post_id });
                setOffers(result);
            };
        });

        socket.on('new_message', () => setCountInMessages(count => count + 1));
        socket.on('received event', async () => await searchNotifications());

        return (() => socket.off());
    });

    useEffect(() => {
        if (activatePayment) document.querySelector('body').style.overflow = 'hidden'
        else document.querySelector('body').style.overflow = 'auto';
    });

    useEffect(() => {
        const searchProducts = async () => {
            const productObtained = await getProducts({ id: post_id });
            if (productObtained.error) navigate('/')
            else setProduct(productObtained);
        };
        searchProducts();
    }, [post_id, navigate]);

    useEffect(() => {
        if (product !== null && userInformation._id !== product.owner) navigate('/');
    }, [product, userInformation, navigate]);

    useEffect(() => {
        const searchOffers = async () => {
            const result = await getOffer({ id_product: post_id });
            setOffers(result);
        };
        searchOffers();
    }, [post_id]);

    return (
        <div className="post-control-container">
            {offers !== null && product !== null ? (
                <div className="post-control">
                    <div className="post-control-header-title">
                        <Link to={product !== null ? `/post/information/${product._id}` : '/'}><i className="fas fa-chevron-left"></i></Link>
                        <h1>{product !== null
                            ? product.title
                            : 'Cargando..'}</h1>
                    </div>
                    <hr />
                    <div className="post-control-card">
                        {offers.length > 0
                            ? offers.map((offer, index) => {
                                return (
                                    <div key={offer._id}>
                                        <OfferCard 
                                            advancePayment={product.advancePayment}
                                            paymentType={product.paymentType}
                                            activatePayment={activatePayment}
                                            setActivatePayment={setActivatePayment}
                                            userInformation={userInformation}
                                            productValue={product.valueNumber}
                                            username={offer.username} 
                                            name={offer.firstName} 
                                            lastname={offer.lastName} 
                                            offer={offer.amountString} 
                                            offerInNumber={offer.amountNumber} 
                                            user_id={offer.user} 
                                            product_id={post_id} 
                                            setOffers={setOffers} 
                                            offers={offers} 
                                            index={index}
                                            productTitle={product.title}/>
                                    </div>
                                );
                            }) : <h1 className="thereAreNoOffers">NO HAY OFERTAS HECHAS</h1>}
                    </div>
                </div>
            ) : <Loading margin="auto"/>}
        </div>
    );
};

export default PostControl;