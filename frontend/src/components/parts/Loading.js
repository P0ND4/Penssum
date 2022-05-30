function Loading ({ center, size, margin, background, optionText }){
    return (
        <div style={{
            position: center ? 'fixed' : 'inherit', 
            top: center ? '0' : '',
            bottom: center ? '0' : '',
            right: center ? '0' : '',
            left: center ? '0' : '',
            display: center ? 'flex' : '',
            flexDirection: optionText !== undefined ? 'column' : 'row',
            justifyContent: center ? 'center' : '',
            alignItems: center ? 'center' : '',
            background: background ? '#1B262CCC' : '',
            zIndex: 100
        }} className="loading-container">
            <div className="loading" style={{ 
                width: `${size}px`,
                height: `${size}px`,
                margin: margin === 'auto' ? '10px auto' : '',
            }}></div>
            {optionText !== undefined && (
                <p style={{
                    margin: '20px 0',
                    fontSize: optionText.fontSize,
                    color: optionText.colorText,
                    textAlign: 'center'
                }}>{optionText.text}</p>
            )}
        </div>
    );
};

export default Loading;