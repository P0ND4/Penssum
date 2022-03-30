import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import OfferCard from "../../parts/post/OfferCard";
import { getProducts, getOffer } from "../../../api";

function PostControl({ userInformation, countInMessages, setCountInMessages }) {
    const [offers, setOffers] = useState([]);
    const [product, setProduct] = useState(null);

    const { post_id } = useParams();
    const navigate = useNavigate();

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
            if (!result.error) setOffers(result);
        };
        searchOffers();
    }, [post_id]);

    return (
        <div className="post-control-container">
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
                                    <OfferCard username={offer.username} name={offer.firstName} lastname={offer.lastName} offer={offer.amount} key={index} user_id={offer.user} product_id={post_id} setOffers={setOffers} offers={offers} index={index} countInMessages={countInMessages} setCountInMessages={setCountInMessages} productTitle={product.title}/>
                                </div>
                            );
                        }) : <h1 className="thereAreNoOffers">NO HAY OFERTAS HECHAS</h1>}
                </div>
            </div>
        </div>
    );
};

export default PostControl;