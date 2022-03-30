import { Link } from 'react-router-dom';

function Product({ data }) {
    return (
        <Link to={`/post/information/${data.uniqueId}`} style={{ textDecoration: 'none' }}>
            <section className="product">
                <div className="product-image" style={{ backgroundImage: data.image }}>
                    <span className="product-delivery-date">Fecha De Entrega: <br/>{data.dateOfDelivery}</span>
                </div>
                <div className="product-content">
                    <p className="product-main-category">{data.mainCategory}</p>
                    <p className="product-category">{data.category}: {data.title}</p>
                    <p className="description">{data.description}</p>
                </div>
                <p className="product-price">Precio: {data.price}</p>
                {data.review === true ? <i className="fas fa-history review-product"></i> : <></>}
            </section>
        </Link>
    );
};

export default Product;