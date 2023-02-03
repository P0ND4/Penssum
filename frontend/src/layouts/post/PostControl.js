import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import OfferCard from "../../components/post/OfferCard";
import { getProducts, getOffer, socket } from "../../api";
import Loading from "../../components/Loading";

// Slice redux
import { increment } from "../../features/user/messagesSlice";

//

import { useNotificationSocket } from "../../helpers/socketHandler";

function PostControl() {
  const user = useSelector((state) => state.user);

  const [offers, setOffers] = useState(null);
  const [product, setProduct] = useState(null);
  const [activatePayment, setActivatePayment] = useState(false);

  const dispatch = useDispatch();
  const { post_id } = useParams();
  const navigate = useNavigate();

  useNotificationSocket();

  useEffect(() => {
    socket.on("new offer", async ({ productID }) => {
      if (productID === post_id) {
        const result = await getOffer({ id_product: post_id });
        setOffers(result);
      }
    });

    socket.on("new_message", () => dispatch(increment()));

    return () => socket.off();
  });

  useEffect(() => {
    const searchProducts = async () => {
      const productObtained = await getProducts({ id: post_id });
      if (productObtained.error) navigate("/");
      else setProduct(productObtained);
    };
    searchProducts();
  }, [post_id, navigate]);

  useEffect(() => {
    if (product !== null && user._id !== product.owner) navigate("/");
  }, [product, user, navigate]);

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
            <Link
              to={product !== null ? `/post/information/${product._id}` : "/"}
            >
              <i className="fas fa-chevron-left"></i>
            </Link>
            <h1>{product !== null ? product.title : "Cargando.."}</h1>
          </div>
          <hr />
          <div className="post-control-card">
            {offers.length > 0 ? (
              offers.map((offer, index) => {
                return (
                  <div key={offer._id}>
                    <OfferCard
                      advancePayment={product.advancePayment}
                      paymentType={product.paymentType}
                      activatePayment={activatePayment}
                      setActivatePayment={setActivatePayment}
                      productValue={product.valueNumber}
                      username={offer.username}
                      name={offer.firstName}
                      lastname={offer.lastName}
                      value={offer.value}
                      user_id={offer.user}
                      product_id={post_id}
                      setOffers={setOffers}
                      offers={offers}
                      index={index}
                      productTitle={product.title}
                    />
                  </div>
                );
              })
            ) : (
              <h1 className="thereAreNoOffers">NO HAY OFERTAS HECHAS</h1>
            )}
          </div>
        </div>
      ) : (
        <Loading margin="auto" />
      )}
    </div>
  );
}

export default PostControl;
