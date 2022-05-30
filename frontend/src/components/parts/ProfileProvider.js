import { useEffect, useState } from 'react';
import { getVote } from '../../api';
import { Link } from 'react-router-dom';

function ProfileProvider(data) {
    const [score,setScore] = useState({ votes: 0, count: 0 });

    useEffect(() => {
        const checkVote = async () => {
            const result = await getVote({ 
                to: data.id,
                voteType: 'user'
            });

            setScore(result);
        };
        checkVote();
    },[data]);

    return (
        <Link className="profile_provider" to={`/${data.link}`} style={{ background: `linear-gradient(45deg, #1B262Cbb,#0F4C7588), url(${data.coverImage})` }}>
            <img src={data.profileImage} className="profile_provider-image" alt="profile_provider" />
            <div className="profile_provider-data">
                <div className="profile_provider-name-and-description">
                    <h1 className="profile_provider-name">{data.name}</h1>
                    <p className="profile_provider-description">{data.description}</p>
                </div>
                <div className="profile_provider-score-container">
                    <h1 className="score-in-text">Puntuacion: {score.votes === 0 ? '' : score.votes % 1 === 0 ? score.votes : score.votes.toFixed(1)}</h1>
                    <div className="profile_provider-score">
                        <i className="fas fa-star" style={{ color: Math.round(score.votes) === 5 ? '#fbff00' : '' }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(score.votes) === 4 || Math.round(score.votes) === 5 ? '#fbff00' : '' }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(score.votes) === 3 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 ? '#fbff00' : ''  }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(score.votes) === 2 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 || Math.round(score.votes) === 3 ? '#fbff00' : ''  }}></i>
                        <i className="fas fa-star" style={{ color: Math.round(score.votes) === 1 || Math.round(score.votes) === 5 || Math.round(score.votes) === 4 || Math.round(score.votes) === 3 || Math.round(score.votes) === 2 ? '#fbff00' : ''  }}></i>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProfileProvider;