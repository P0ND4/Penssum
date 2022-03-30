function Loading ({ center, size, margin }){
    return (
        <div className="loading" style={{ 
            width: `${size}px`,
            height: `${size}px`,
            position: center ? 'absolute' : 'inherit', 
            top: center ? '0' : '',
            bottom: center ? '0' : '',
            right: center ? '0' : '',
            left: center ? '0' : '',
            margin: center ? 'auto' : margin === 'auto' ? '10px auto' : '',
        }}></div>
    );
};

export default Loading;