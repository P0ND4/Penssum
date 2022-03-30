import { Link } from 'react-router-dom';

function Error404 (){
    return (
        <div className="error404">
            <h1 className="error404Title">LO SENTIMOS</h1>
            <p className="error404Description">
                La URL al cual viajo no existe, por favor vuelva al menu principal, puede ir rapidamente 
                presionando <Link className="error-click-here" to="/">Aqui</Link>
            </p>
            <img src="/img/404.svg" alt="404"/>
        </div>
    );
};

export default Error404;