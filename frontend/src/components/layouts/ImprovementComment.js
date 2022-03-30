import { Link } from 'react-router-dom';

function ImprovementComment() {
    return (
        <div className="improvementComment-container">
            <div className="improvementComment">
                <form className="improvementComment-form">
                    <h1 className="improvementComment-title">¿Cómo podemos mejorar?</h1>
                    <div className="improvementComment-divider">
                        <select className="selectImprovement" id="selectImprovement">
                            <option select hidden>-- ELIGE UN AREA --</option>
                            <option>Anuncios</option>
                            <option>Barra de navegacion</option>
                            <option>Barra de navegacion De Usuario</option>
                            <option>Cotizacion</option>
                            <option>Configuraciones De Perfil</option>
                            <option>Grafica</option>
                            <option>Mensajeria</option>
                            <option>Ofertar y contraoferta</option>
                            <option>Perfil</option>
                            <option>Pie de pagina</option>
                            <option>Publicacion de producto</option>
                            <option>Seccion de inicio</option>
                            <option>Videollamada</option>
                            <option>Otro</option>
                        </select>
                        <div className="form-control ">
                            <textarea className="improvementComment-description" placeholder="Incluye toda la informacion posible..."></textarea>
                        </div>
                        <div className="form-control">
                            <label for="search-image-video-to-improve" className="search-image-video-in-improvementComment">Agregar captura de pantalla o video (recomendado)</label>
                            <input type="file" id="search-image-video-to-improve" hidden />
                        </div>
                        <p className="improve-opinion">
                            Envíanos tus comentarios si tienes ideas para ayudarnos a mejorar nuestros productos.
                            Si necesitas ayuda para solucionar un problema concreto, <Link to="/help" className="link-help-service">accede al servicio de ayuda</Link>.
                        </p>
                        <p  className="improve-warning">Advertencia: cualquier contenido obsceno podria traer como consecuencia la suspencion o el bloqueo de su cuenta.</p>
                        <div className="form-control">
                            <button id="send-improve">Enviar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImprovementComment;