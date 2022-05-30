function CoverImageInformation(data) {
    return (
        <div className="main-image-info">
            <div className="left-info">
                <h1 className="title-carousel">{data.title}</h1>
                <p>Categoria: {data.category}</p>
                <p>{data.customCategory}: {data.title}</p>
                <div className="carousel-image-score-container">
                    <h1 className="carousel-image-score-title">Puntuacion: {data.votes === 0 ? '' : data.votes % 1 === 0 ? data.votes : data.votes.toFixed(1)}</h1>
                    <div className="carousel-image-score">
                        <i className="fas fa-star" style={{ color: Math.round(data.votes) === 1 || Math.round(data.votes) === 5 || Math.round(data.votes) === 4 || Math.round(data.votes) === 3 || Math.round(data.votes) === 2 ? '#fbff00' : ''  }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(data.votes) === 2 || Math.round(data.votes) === 5 || Math.round(data.votes) === 4 || Math.round(data.votes) === 3 ? '#fbff00' : ''  }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(data.votes) === 3 || Math.round(data.votes) === 5 || Math.round(data.votes) === 4 ? '#fbff00' : ''  }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(data.votes) === 4 || Math.round(data.votes) === 5 ? '#fbff00' : '' }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(data.votes) === 5 ? '#fbff00' : '' }}></i>
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