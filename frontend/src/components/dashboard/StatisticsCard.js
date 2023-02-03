function StatisticsCard (data) {
    return (
        <div className="statistics-card" style={{ borderLeft: `5px solid ${data.color}` }}>
            <div>
                <p className="statistics-name" style={{ color: data.color }}>{data.name}</p>
                <h1 style={{ color: data.color }}>{data.information}</h1>
            </div>
            <i className={`statistics-icono ${data.icono}`} style={{ color: data.color }}></i>
        </div>
    );
};

export default StatisticsCard;