function CardSelection({ title, description, src, alt, sendUserSelection, sendingInformation }) {
    return (
        <section 
            style={{
                opacity: sendingInformation ? '.4' : '', 
                cursor: sendingInformation ? 'not-allowed' : '' 
            }} 
            onClick={() => { if (!sendingInformation) sendUserSelection(alt)}}
        >
            <img src={src} alt={alt}/>
            <h1>{title}</h1>
            <p>{description}</p>
        </section>
    );
};

export default CardSelection;