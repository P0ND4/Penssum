import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { changeDate } from '../helpers';

import CoverImageInformation from '../parts/CoverImageInformation';
import Product from '../parts/Product';

function Main({ username, products, auth, productsToPut }) {
    const [position, setPosition] = useState(0);
    const [productLimit, setProductLimit] = useState(false);

    let productCount = useRef(0).current;

    useEffect(() => productsToPut.current = [],[products, productsToPut]);

    useEffect(() => {
        const interval =
            (products !== null && products.length > 0) ?
                setInterval(() => {
                    if (position + 1 === products.length || position + 1 === 9) {
                        setPosition(0);
                    } else setPosition(position + 1);
                }, 5000)
                : '';

        return (() => clearInterval(interval));
    });

    const putPost = useCallback(
        (num) => {
            for (let i = 0; i < num; i++) {
                if (!products[productCount]) {
                    setProductLimit(true);
                    break;
                };

                productsToPut.current.push(products[productCount]);

                productCount++;
            }
        }, [productCount, products, productsToPut]
    );

    useEffect(() => { if (products !== null) { putPost(20); }}, [putPost, products]);

    return (
        <div>
            <header className="main-home-carousel">
                {(products !== null && products.length > 0)
                    ? <div className="main-image-container_carousel">
                        {products.map((product, index) => index < 9 && (
                                    <Link className="carousel-image" to={`/post/information/${product._id}`} style={{ background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url(${product.linkMiniature}) center`, backgroundSize: 'cover', transform: `translateX(-${position}00%)`, textDecoration: 'none' }} key={product._id}>
                                        <CoverImageInformation
                                            title={product.title}
                                            category={product.category}
                                            customCategory={product.customCategory}
                                            dateOfDelivery={product.dateOfDelivery === null ? 'Indefinido' : changeDate(product.dateOfDelivery)}
                                            value={product.value === null ? 'Negociable' : `${product.value}$`}
                                            description={product.description}
                                        />
                                    </Link>
                                )
                        )}
                    </div>
                    : <div className="carousel-image" style={{ background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url("/img/Penssum-cover.jpeg")` }}>
                        <div className="main-image-info-no-products">
                            <h1 className="title-carousel">PENSSUM</h1>
                            <p className="carousel-image-description">
                                Somos una plataforma de comercio electronico basado en ofertas y contraofertas,
                                nuestro principal objetivo es dar la mayor facilidad y calidad a nuestros usuarios
                                de poder conseguir los mejores profesores del mundo, consiga los mejores precios
                                en nuestra plataforma, todas sus dudas pueden ser respondidas por profesores en un ambito
                                profesional en el area, disfrute del uso completo de nuestra aplicacion web.
                            </p>
                        </div>
                    </div>}
            </header>
            <div className="home-events-button-container">
                {(products !== null && products.length > 0) ? <Link to={auth ? `/post/activity` : '/signin'} className="home-events-button">Crea una publicacion</Link> : <></>}
                {(products !== null && products.length > 0) ? <Link to={auth ? '/send/quote' : '/signin'} className="home-events-button">Enviar una cotizacion</Link> : <></>}
            </div>
            {products !== null && products.length > 0
                ? <></>
                : <div className="thereAreNoProducts-container">
                    <div className="thereAreNoProducts">
                        <h1>NO HAY PRODUCTOS</h1>
                        <Link to={username === undefined ? '/signin' : `/post/activity`} className="button-thereAreNoProducts">SE EL PRIMERO EN CREAR TU SERIVICIO</Link>
                    </div>
                </div>}
            <div className="product-container">
                {(productsToPut.current.length > 0)
                    ? productsToPut.current.map(product => {
                        return (
                            <div key={product._id}>
                                <Product
                                    data={{
                                        uniqueId: product._id,
                                        image: `url(${product.linkMiniature})`,
                                        dateOfDelivery: product.dateOfDelivery === null ? 'No definido' : changeDate(product.dateOfDelivery),
                                        mainCategory: product.category,
                                        category: product.subCategory,
                                        title: product.title,
                                        description: product.description.slice(0, 40) + '...',
                                        price: product.value === null ? 'Negociable' : `${product.value}$`
                                    }}
                                />
                            </div>
                        );
                    }) : <></>}
            </div>
            {!productLimit && products !== null && products.length > 0
                ?   <div className='show-more-products-container'>
                        <button className='show-more-products' onClick={() => putPost(20)}>MOSTRAR MAS</button>
                    </div>
                : <></>}
        </div>
    );
};

export default Main;