function ContactForm(data) {
    return (
        <div className="dark dark-control" id={data.id}>
            <div className="dark-contact-form">
                <h1>{data.title}</h1>
                <hr/>
                <p className="dark-contact-p">{data.description}</p>
                <div className="form-control">
                    <input placeholder={data.placeholder} />
                </div>
                <div className="form-control">
                    <textarea className="textarea-dark" placeholder={data.textareaPlaceholder} id={data.idTextarea}></textarea>
                </div>
                <div className="search-file-in-contact-zone-container">
                    <label for={data.idInput}>Buscar imagenes/archivos ({data.dataValue})</label>
                    <input type="file" id={data.idInput} hidden />
                </div>
                <div className="dark-button-container">
                    <button className="save-edit">Guardar</button>
                    <button className="cancel-edit" onClick={() => {
                        document.getElementById(data.id).style.display = 'none';
                        document.querySelector('body').style.overflow = 'auto';
                        document.getElementById(data.idTextarea).value = '';
                        document.getElementById(data.idInput).value = '';
                    }}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;