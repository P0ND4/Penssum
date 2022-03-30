import { useNavigate } from 'react-router-dom';

function HelpCard(data) {
    const navigate = useNavigate();
    return (
        <section className="help-card" onClick={() => {
            if (data.element !== 'Link') {
                document.getElementById(data.idDark).style.display = 'flex';
                document.querySelector('body').style.overflow = 'hidden';
            } else navigate('/help/information/mod=general');
        }}>
            <img src={data.src} alt={data.alt} />
            <div>
                <h1>{data.h1}</h1>
                <p>{data.p}</p>
            </div>
        </section>
    );
};

export default HelpCard;