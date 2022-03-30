import { deleteProduct, acceptProduct, removeOffer } from "../../../api";

function ReviewProduct({ data }) {
    const removeProduct = async () => {
        await removeOffer({ files: data.product.files });
        const result = await deleteProduct({ id: data.id, notification: true });
        data.setInformation({ ...data.information, productsToReview: result.length });
        data.setProductsToReview(result);
    };

    const allowProduct = async () => {
        const result = await acceptProduct(data.id);
        data.setInformation({ ...data.information, productsToReview: result.length });
        data.setProductsToReview(result);
    };

    return (
        <section className="product reviewProduct">
            <div>
                <a style={{ textDecoration: 'none' }} href={`/post/information/${data.id}`} target="_blank" rel="noreferrer">
                    <div className="product-image" style={{ backgroundImage: data.image }}>
                        <span className="product-delivery-date">Fecha De Entrega: <br />{data.dateOfDelivery}</span>
                    </div>
                    <div className="product-content">
                        <p className="product-main-category">{data.mainCategory}</p>
                        <p className="product-category">{data.category}: {data.title}</p>
                        <p className="description">{data.description}</p>
                    </div>
                    <p className="product-price">Precio: {data.price}</p>
                </a>
                <div className="review-products-button">
                    <button id="approve" onClick={() => allowProduct()}>Aprobar</button>
                    <button id="disapproved" onClick={() => removeProduct()}>Desaprobar</button>
                </div>
            </div>
        </section>

    );
};

export default ReviewProduct;