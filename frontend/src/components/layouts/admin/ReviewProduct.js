import { deleteProduct, acceptProduct, removeFiles, getProducts, socket } from "../../../api";
import { thousandsSystem } from '../../helpers';

function ReviewProduct({ data }) {
    const removeProduct = async () => {
        await removeFiles({ files: data.product.files, activate: true });
        const result = await deleteProduct({ id: data.id, notification: true });
        socket.emit('received event', data.owner);
        data.setInformation({ ...data.information, productsToReview: result.length });
        data.setProductsToReview(result);
        const productsObtained = await getProducts();
        data.setProducts(productsObtained);
    };

    const allowProduct = async () => {
        const result = await acceptProduct(data.id);
        socket.emit('received event', data.owner);
        data.setInformation({ ...data.information, productsToReview: result.length });
        data.setProductsToReview(result);
        const productsObtained = await getProducts();
        data.setProducts(productsObtained);
    };

    const sizes = ["", "Billon", "Trillon", "Cuatrillon", "Quintillon", "Sextillon"];
    const reduce = value => {
        const i = parseInt(Math.floor(Math.log(value) / Math.log(1000000000)));
        return "$" + thousandsSystem(Math.round(value / Math.pow(1000000000, i), 2)) + " " + sizes[i];
    };

    return (
        <section>
            <a style={{ textDecoration: 'none' }} href={`/post/information/${data.id}`} target="_blank" rel="noreferrer">
                <div className="product reviewProduct">
                    <div className="product-image" style={{ backgroundImage: data.image }}>
                        <span className="product-delivery-date">Fecha De Entrega: <br />{data.dateOfDelivery}</span>
                    </div>
                    <div className="product-content">
                        <p className="product-main-category">{data.mainCategory}</p>
                        <p className="product-category">{data.category}: {data.title}</p>
                        <p className="description">{data.description}</p>
                    </div>
                    <p className="product-price">Precio: {reduce(data.price)}</p>
                </div>
            </a>
            <div className="review-products-button">
                <button id="approve" onClick={() => allowProduct()}>Aprobar</button>
                <button id="disapproved" onClick={() => removeProduct()}>Desaprobar</button>
            </div>
        </section>

    );
};

export default ReviewProduct;