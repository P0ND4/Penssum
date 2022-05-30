import { changeDate } from '../helpers';
import { Link } from 'react-router-dom';

function NotificationSection({ productId, username, title, creationDate, description, files, admin }) {
    return (
        <section className="notification-section">
            <div className="notification-header">
                {username !== 'Admin' 
                    ? !admin ? <Link to={`/${username}`} className="notification-header-title"><h2>@{username}</h2></Link> : <a href={`http://localhost:3000/${username}`} className="notification-header-title" rel="noreferrer" target="_blank"><h2>@{username}</h2></a>  
                    : <h2 className="notification-header-title-admin">{username}</h2>}
                <h4>{title}</h4>
                <p>{changeDate(creationDate)}</p>
            </div>
            <hr />
            <div className="notification-body">
                <p>{description}. {productId !== '' ? <Link to={`/post/information/${productId}`} style={{ color: '#3282B8' }}>Ir al producto</Link> : ''}</p>
                {files !== undefined && files.length > 0
                    ? <div className="notification-pictures-container">
                        {files.map(file => {
                            return (
                                <div key={file.uniqueId}>
                                    <a href={file.url} rel="noreferrer" target="_blank">
                                        <img src={
                                            (file.extname === '.pdf')
                                                ? '/img/pdf_image.svg'
                                                : (file.extname === '.doc' || file.extname === '.docx')
                                                    ? '/img/word_image.svg'
                                                    : (file.extname === '.epub' || file.extname === '.azw' || file.extname === '.ibook')
                                                        ? '/img/document_image.svg'
                                                        : file.url
                                        }
                                            referrerPolicy="no-referrer"
                                            alt="selected_image"
                                        />
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                    : ''}
            </div>
        </section>
    );
};

export default NotificationSection;