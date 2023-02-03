function PlainNotification({ title, description, color, image }) {
    return (
        <div className="plain-notification">
            <div className="image-plain-notification-container">
                <img src={(image === null) ? "/img/noProfilePicture.png" : image === 'admin' ? '/img/Penssum-icon.jpeg' : image} className="image-plain-notification" referrerPolicy="no-referrer" alt="user-notification" />
                <div className="notification-type" style={{ 
                    background: color === 'blue' ? '#3282B8' 
                              : color === 'orange' ? '#ff8400' 
                              : color === 'yellow' ? '#fff704' 
                              : color === 'green' ? '#04ba22' : '' 
                }}></div>
            </div>
            <div className="description-plain-notification">
                <h4>{title}</h4>
                <p>{description.trimStart().trimEnd().slice(0, 60) + '...'}</p>
            </div>
        </div>
    );
};

export default PlainNotification;