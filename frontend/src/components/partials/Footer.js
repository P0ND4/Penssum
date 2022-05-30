import { Link } from 'react-router-dom';

import SecondaryInformation from '../parts/SecondayInformacion';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer">
                <div className="useful-information">
                    <h1 className="useful-information-title">INFORMACION UTIL</h1>
                    <ul className="footer-navigation">
                        <li><Link className="main-footer-link" to="/help">CONTACTO Y AYUDA</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=security">CONSEJO DE SEGURIDAD</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=security">COMO APORTAMOS A TU SEGURIDAD</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=terms_and_conditions">TERMINOS Y CONDICIONES</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=products">VENDE RAPIDO</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=frequent_questions">PREGUNTAS FRECUENTES</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=penssum">ACERCA DE PENSSUM</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/mod=penssum">SUMATE A PENSSUM</Link></li>
                    </ul>
                </div>
                <div className="secondary-information-container">
                    <SecondaryInformation
                        src="/img/business.svg"
                        title="Compra sin moverte"
                        description="Encuentra lo que necesitas, y coordina el pago y la entrega con el vendedor. Es fácil y rápido. ¡Todos podemos hacerlo!"
                        link="Cómo comprar en Penssum"
                        navigation="/help/information/mod=products"
                    />
                    <SecondaryInformation
                        src="/img/get.svg"
                        title="Recibe tu producto"
                        description="Acuerda la entrega de tu compra con el vendedor. Puedes recibirlo en tu casa, en la oficina o retirarlo. ¡Tú decides qué prefieres!"
                        link="Cómo coordino la entrega"
                        navigation="/help/information/mod=products"
                    />
                    <SecondaryInformation
                        src="/img/money.svg"
                        title="Vende gratis"
                        description="Miles de personas quieren lo que ofreces. Publica y verás qué pronto llegan las compras. ¡Tú no pagas nada!"
                        link="Cómo publicar un producto en penssum"
                        navigation="/help/information/mod=products"
                    />
                </div>
                <hr />
                <div className="rights">
                    <div className='support-and-right'>
                        <h3 className="law-degree">Todos los derechos de la pagina estan reservados y pertenece al equipo de desarrollo Y3KC3 Venezuela-Caracas</h3>
                        <h3 className='support-number'><i className="fab fa-whatsapp"></i> Numero De Soporte: +58 4167101775</h3>
                    </div>
                    <div className="social-networks-container">
                        <h2 className="social-networks-title">Siguenos en nuestras redes sociales</h2>
                        <div className="social-networks">
                            <Link to="/"><i className="fab fa-twitter"></i></Link>
                            <Link to="/"><i className="fab fa-facebook-square"></i></Link>
                            <Link to="/"><i className="fab fa-instagram"></i></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <p>Paises disponible: Colombia</p>
                <p>TODOS LOS DERECHOS RESERVADOS © 2022 PENSSUM-EQUIPO-DE-DESARROLLO-Y3KC3</p>
            </div>
        </footer>
    );
};

export default Footer;