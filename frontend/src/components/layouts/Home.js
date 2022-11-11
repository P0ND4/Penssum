import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { changeDate, verificationOfInformation } from "../helpers";

import CoverImageInformation from "../parts/CoverImageInformation";
import Product from "../parts/Product";

function Main({
  userInformation,
  username,
  products,
  auth,
  productsToPut,
  userErrorHandler,
  isTheUserSuspended,
}) {
  const [position, setPosition] = useState(0);
  const [productLimit, setProductLimit] = useState(false);

  const navigate = useNavigate();

  let productCount = useRef(0).current;

  useEffect(() => (productsToPut.current = []), [products, productsToPut]);

  useEffect(() => {
    const interval =
      products.length > 0
        ? setInterval(() => {
            if (position + 1 === products.length || position + 1 === 9) {
              setPosition(0);
            } else setPosition(position + 1);
          }, 5000)
        : "";

    return () => clearInterval(interval);
  });

  const putPost = useCallback(
    (num) => {
      for (let i = 0; i < num; i++) {
        if (!products[productCount]) {
          setProductLimit(true);
          break;
        }

        productsToPut.current.push(products[productCount]);

        productCount++;
      }
    },
    [productCount, products, productsToPut]
  );

  useEffect(() => putPost(20), [putPost, products]);

  const checkAuth = (typeOfButton) => {
    if (!auth) {
      swal({
        title: "No estás registrado",
        text:
          typeOfButton === "quote"
            ? "Para enviar una actividad necesitas tener una cuenta como PROFESOR ¿quieres crear una cuenta?"
            : "Para hacer una publicación necesitas tener una cuenta como Alumno, ¿quieres crear una cuenta?",
        icon: "info",
        buttons: ["No", "Si"],
      }).then((res) => res && navigate("/signup"));
    } else
      navigate(
        verificationOfInformation(userInformation.objetive, userInformation)
          ? typeOfButton === "quote"
            ? "/send/quote"
            : "/post/activity"
          : "/complete/information"
      );
  };

  return (
    <div>
      <header className="main-home-carousel">
        {!userErrorHandler && products.length > 0 ? (
          <div className="main-image-container_carousel">
            {products.map(
              (product, index) =>
                index < 9 && (
                  <Link
                    className="carousel-image"
                    to={`/post/information/${product._id}`}
                    style={{
                      background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url(${product.linkMiniature}) center`,
                      backgroundSize: "cover",
                      transform: `translateX(-${position}00%)`,
                      textDecoration: "none",
                    }}
                    key={product._id}
                  >
                    <CoverImageInformation
                      title={product.title}
                      category={product.category}
                      customCategory={product.customCategory}
                      dateOfDelivery={
                        product.dateOfDelivery === null
                          ? "Indefinido"
                          : changeDate(product.dateOfDelivery)
                      }
                      value={
                        product.valueNumber === 0
                          ? "Negociable"
                          : `$${product.valueString}`
                      }
                      description={product.description}
                      votes={product.votes}
                    />
                  </Link>
                )
            )}
          </div>
        ) : userErrorHandler ? (
          <div
            className="carousel-image"
            style={{
              background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url("/img/Penssum-cover.jpeg")`,
            }}
          >
            <div className="main-image-info-no-products">
              <h1 className="title-carousel">Estás bloqueado :(</h1>
              <p className="carousel-image-description">
                Hemos detectado que has violado las políticas del uso de
                Penssum, queremos hacer un ambiente sano y seguro, hemos visto
                que no has cumplido con las políticas del uso de Pénsum, por
                ende esta cuenta queda bloqueada permanentemente, no podrá hacer
                uso de Penssum por medio de esta cuenta, no podrá eliminar la
                cuenta ni los datos registrados en la misma, de verdad, disculpe
                las molestias ocasionadas, pero nos hemos visto en la obligación
                de bloquearlo.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="carousel-image"
            style={{
              background: `linear-gradient(45deg, #1B262Cbb,#2c373ddd), url("/img/Penssum-cover.jpeg")`,
            }}
          >
            <div className="main-image-info-no-products">
              <h1 className="title-carousel">Penssum</h1>
              <p className="carousel-image-description">
                Penssum es una plataforma de asistencia académica, que permite a
                los estudiantes conectarse con los mejores docentes en
                soluciones inmediatas a las actividades diarias curriculares más
                exigentes, es el mejor aliado estratégico para fortalecer y
                obtener conocimientos y las mejores calificaciones de una manera
                fácil, ágil y segura.
              </p>
            </div>
          </div>
        )}
      </header>
      {!userErrorHandler && !isTheUserSuspended && (
        <div className="home-events-button-container">
          {products.length > 0 ? (
            (!auth ||
              (userInformation && userInformation.objetive !== "Profesor")) && (
              <button
                onClick={() => checkAuth("activity")}
                className="home-events-button"
              >
                Crea una publicación
              </button>
            )
          ) : (
            <></>
          )}
          {products.length > 0 ? (
            (!auth ||
              (userInformation && userInformation.objetive !== "Alumno")) && (
              <button
                onClick={() => checkAuth("quote")}
                className="home-events-button"
              >
                Enviar una actividad
              </button>
            )
          ) : (
            <></>
          )}
        </div>
      )}
      {!userErrorHandler &&
        (products.length > 0 ? (
          <></>
        ) : (
          <div className="thereAreNoProducts-container">
            <div className="thereAreNoProducts">
              <h1>Aún no hay publicación</h1>
              {userInformation.objetive !== "Profesor" && (
                <Link
                  to={
                    username === undefined
                      ? "/signin"
                      : verificationOfInformation(
                          userInformation.objetive,
                          userInformation
                        )
                      ? `/post/activity`
                      : "/complete/information"
                  }
                  className="button-thereAreNoProducts"
                >
                  SÉ EL PRIMERO EN CREAR UNA
                </Link>
              )}
            </div>
          </div>
        ))}
      {!userErrorHandler && (
        <div className="product-container">
          {productsToPut.current.length > 0 ? (
            productsToPut.current.map((product) => {
              return (
                <div key={product._id}>
                  <Product
                    data={{
                      uniqueId: product._id,
                      image: `url(${product.linkMiniature})`,
                      dateOfDelivery:
                        product.dateOfDelivery === null
                          ? "No definido"
                          : changeDate(product.dateOfDelivery),
                      mainCategory: product.category,
                      category: product.subCategory,
                      title: product.title,
                      description: product.description.slice(0, 40) + "...",
                      price: product.valueNumber,
                    }}
                  />
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      )}
      {!userErrorHandler &&
        (!productLimit && products.length > 0 ? (
          <div className="show-more-products-container">
            <button className="show-more-products" onClick={() => putPost(20)}>
                MOSTRAR MÁS
            </button>
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
}

export default Main;
