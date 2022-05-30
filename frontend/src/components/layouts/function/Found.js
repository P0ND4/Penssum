import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { searchUsers } from '../../../api';
import Loading from '../../parts/Loading';
import ProfileProvider from "../../parts/ProfileProvider";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Found({ filterNav }) {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(false);

    const { profile_provider } = useParams();

    const searchTimer = useRef();

    useEffect(() => {
        clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(async () => {
            const result = await searchUsers({ id: cookies.get('id'), search: profile_provider, filterNav });
            if (result.error) setError(true)
            else {
                setUsers(result);
                setError(false);
            };
        },1000);
    }, [profile_provider,filterNav]);

    const name = (firstName, lastName, username) => {
        if (firstName === '' && lastName === '') {
            return username;
        } else { return `${firstName} ${lastName}` }
    };

    return (
        <div className="found-container">
            <div className="found">
                <h1 className="main-profile_provider-title">{users.length > 0 && !error ? 'Resultado de la busquedad' : !error ? 'Buscando...' : 'No se ha encontrado ningun usuario'}</h1>
                <section className="profile_provider-found">
                    {users.length > 0 && !error
                        ? users.map(user => user._id !== cookies.get("id") ? (
                            <div key={user._id} className="profile-provider-container">
                                <ProfileProvider
                                    id={user._id}
                                    coverImage={user.coverPhoto === null ? "/img/cover.jpg" : user.coverPhoto}
                                    profileImage={user.profilePicture === null ? "/img/noProfilePicture.png" : user.profilePicture}
                                    name={name(user.firstName, user.lastName, user.username)}
                                    description={user.description}
                                    link={user.username}
                                />
                            </div>) : <></>
                        ) : !error ? <Loading /> : <img src="/img/usersNotFound.svg" alt="user not found" className='img-user-not-found-search' />}
                </section>
            </div>
        </div>
    );
};

export default Found;