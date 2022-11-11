import { Link } from 'react-router-dom';

function SecondaryInformation({ src, title, description, link, navigation }) {
    return (
        <section className="secondary-information">
            <img className="secondary-information-image" src={src} alt="business" />
            <h2 className="secondary-information-title">{title}</h2>
            <p className="secondary-information-description">{description}</p>
            <Link className="secondary-information-link" to={navigation}>{link}</Link>
        </section>
    );
};

export default SecondaryInformation;