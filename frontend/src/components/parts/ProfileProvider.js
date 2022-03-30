import { Link } from 'react-router-dom';

function ProfileProvider(data) {
    return (
        <Link className="profile_provider" to={`/${data.link}`} style={{ background: `linear-gradient(45deg, #1B262Cbb,#0F4C7588), url(${data.coverImage})` }}>
            <img src={data.profileImage} className="profile_provider-image" alt="profile_provider" />
            <div className="profile_provider-data">
                <div className="profile_provider-name-and-description">
                    <h1 className="profile_provider-name">{data.name}</h1>
                    <p className="profile_provider-description">{data.description}</p>
                </div>
                <div className="profile_provider-score-container">
                    <h1 className="score-in-text">Puntuacion {data.score}</h1>
                    <div className="profile_provider-score">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProfileProvider;