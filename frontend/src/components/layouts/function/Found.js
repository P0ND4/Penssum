import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { searchUsers, searchProducts } from '../../../api';
import Loading from '../../parts/Loading';
import ProfileProvider from "../../parts/ProfileProvider";
import { changeDate } from '../../helpers/';
import Product from '../../parts/Product';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Found({ filterNav, userInformation, auth }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);

    const { profile_provider } = useParams();

    const searchTimer = useRef();

    useEffect(() => {
        setData([]);
        clearTimeout(searchTimer.current);
        setError(false);

        searchTimer.current = setTimeout(async () => {
            let result;
            if (userInformation.objetive === 'Alumno' || !auth) result = await searchUsers({ id: cookies.get('id'), search: profile_provider, filterNav });
            if (userInformation.objetive === 'Profesor') result = await searchProducts({ search: profile_provider, filterNav });
            if (result.error) setError(true)
            else {
                setData(result);
                setError(false);
            };
        },1000);
    }, [profile_provider,filterNav,userInformation,auth]);

    const name = (firstName, lastName, username) => {
        if (firstName === '' && lastName === '') {
            return username;
        } else { return `${firstName} ${lastName}` }
    };

    return (
        <div className="found-container">
            {(userInformation.objetive === 'Alumno' || !auth) && (
                <div className="found">
                    <h1 className="main-data-title-found">{data.length > 0 && !error ? 'Resultado de la busquedad' : !error ? 'Buscando...' : 'No se ha encontrado ningun profesor'}</h1>
                    <section className="profile_provider-found">
                        {data.length > 0 && !error
                            ? data.map(user => user._id !== cookies.get("id") ? (
                                <div key={user._id} className="profile-provider-container">
                                    <ProfileProvider
                                        id={user._id}
                                        coverImage={user.coverPhoto === null ? "/img/cover.jpg" : user.coverPhoto}
                                        profileImage={user.profilePicture === null ? "/img/noProfilePicture.png" : user.profilePicture}
                                        name={name(user.firstName, user.lastName, user.username)}
                                        description={`${user.originalDescription.slice(0,140)}${user.originalDescription.length > 160 ? '...' : ''}`}
                                        valuePerHour={user.valuePerHour}
                                        link={user.username}
                                    />
                                </div>) : <></>
                            ) : !error ? <Loading /> : <img src="/img/usersNotFound.svg" alt="user not found" className='img-data-not-found-search' />}
                    </section>
                </div>
            )}
            {userInformation.objetive === 'Profesor' && (
                <div className="found">
                    <h1 className="main-data-title-found">{data.length > 0 && !error ? 'Resultado de la busquedad' : !error ? 'Buscando...' : 'No se ha encontrado ninguna publicacion'}</h1>
                    <section className="products-found-container">
                        <div className="products-found">
                            {(data.length > 0 && !error) && data.map(product => (
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
                                            price: product.valueNumber
                                        }}
                                    />
                                </div>)
                            )}
                        </div>
                        {(!error && data.length === 0) ? <Loading /> : data.length === 0 ? <img src="/img/usersNotFound.svg" alt="user not found" className='img-data-not-found-search' /> : <></>}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Found;