function CoverImageInformation(data) {
    return (
        <div className="main-image-info">
            <div className="left-info">
                <h1 className="title-carousel">{data.title}</h1>
                <p>Categoria: {data.category}</p>
                <p>{data.customCategory}: {data.title}</p>
                <div className="carousel-image-score-container">
                    <div className="carousel-image-score">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                    </div>
                    <h1 className="carousel-product-score">No disponible</h1>
                    <h1 className="carousel-date-of-delivery-mobile">Fecha de entrega: {data.dateOfDelivery}</h1>
                    <h1 className="carousel-price-mobile">Precio: {data.value}</h1>
                </div>
            </div>
            <div className="right-info">
                <p className="carousel-image-description">{data.description}</p>
                <div className="right-info-union">
                    <h1 className="carousel-date-of-delivery">Disponibilidad: {data.dateOfDelivery}</h1>
                    <h1 className="carousel-price">Precio: {data.value}</h1>
                </div>
            </div>
        </div>
    );
};

export default CoverImageInformation;