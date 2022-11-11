function InformationCard(data) {
    return (
        <div className="information-card-content" id={data.id}>
            <h1>{data.title}</h1>
            <p>{data.content}</p>
        </div>
    );
};

export default InformationCard;