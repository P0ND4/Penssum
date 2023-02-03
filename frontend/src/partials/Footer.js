import { Link } from 'react-router-dom';

import SecondaryInformation from '../components/SecondayInformacion';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer">
                <div className="useful-information">
                    <h1 className="useful-information-title">INFORMACIÓN ÚTIL</h1>
                    <ul className="footer-navigation">
                        <li><Link className="main-footer-link" to="/help">CONTACTO Y AYUDA</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/security">CONSEJO DE SEGURIDAD</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/security">COMO APORTAMOS A TU SEGURIDAD</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/terms_and_conditions">TÉRMINOS Y CONDICIONES</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/products">SOLUCIONA RÁPIDO</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/frequent_questions">PREGUNTAS FRECUENTES</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/penssum">ACERCA DE PENSSUM</Link></li>
                        <li><Link className="main-footer-link" to="/help/information/penssum">SÚMATE A PENSSUM</Link></li>
                    </ul>
                </div>
                <div className="secondary-information-container">
                    <SecondaryInformation
                        src="/img/business.svg"
                        title="Encuentra profesores"
                        description="Encuentra los mejores profesores del mundo en nuestra plataforma, todo sin levantarte de tu silla."
                        link="¿Cómo se manejan las cuentas en Penssum?"
                        navigation="/help/information/accounts"
                    />
                    <SecondaryInformation
                        src="/img/get.svg"
                        title="Recibe lo que necesitas"
                        description="¡Llega a un acuerdo con el profesor o el alumno, para tu apoyo educacional o aporta para la asistencia académica! ¡Tú decides qué hacer!"
                        link="¿Cómo funciona las publicaciones?"
                        navigation="/help/information/products"
                    />
                    <SecondaryInformation
                        src="/img/money.svg"
                        title="PENSSUM GRATIS"
                        description="Miles de personas quieren lo que ofreces. Pública y verás qué pronto llegan los resultados. ¡Tú no pagas nada! Todo para el mejor servicio de nuestro usuario."
                        link="Cómo publicar en penssum"
                        navigation="/help/information/products"
                    />
                </div>
                <hr />
                <div className="rights">
                    <div className='support-and-right'>
                        <h3 className="law-degree">Todos los derechos de la aplicación pertenece a PENSSUM</h3>
                        <h3 className="phone-number-penssum">Escríbenos a nuestro WhatsApp: <a className="whatsapp" href="https://wa.me/573207623454" target="_BLANK" rel="noreferrer"><i className="fa-brands fa-whatsapp"></i> +57 3207623454</a></h3>
                        <h3 className='penssum-version'>PENSSUM Version: 3.0.0v</h3>
                    </div>
                    <div className="social-networks-container">
                        <h2 className="social-networks-title">Síguenos en nuestras redes sociales</h2>
                        <div className="social-networks">
                            <a href="https://wa.me/573207623454" target="_BLANK" rel="noreferrer"><i className="fa-brands fa-whatsapp"></i></a>
                            <a href="https://twitter.com/penssum?t=seJ7n3XjHGKSx8zNBLexmQ&s=09" target="_BLANK" rel="noreferrer"><i className="fab fa-twitter"></i></a>
                            <a href="https://www.facebook.com/Penssum-103217072423786/" target="_BLANK" rel="noreferrer"><i className="fab fa-facebook-square"></i></a>
                            <a href="https://www.instagram.com/penssum/" target="_BLANK" rel="noreferrer"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <p>Países disponibles: Colombia</p>
                <p>PENSSUM © 2022</p>
            </div>
        </footer>
    );
};

export default Footer;