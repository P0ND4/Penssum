function CardSelection({ title, description, src, alt, sendUserSelection }) {
    return (
        <section onClick={() => sendUserSelection(alt)}>
            <img src={src} alt={alt}/>
            <h1>{title}</h1>
            <p>{description}</p>
        </section>
    );
};

export default CardSelection;