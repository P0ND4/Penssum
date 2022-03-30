import { useNavigate } from 'react-router-dom';
import { removeOffer, makeCounteroffer, socket, acceptOffer } from '../../../api';
import swal from 'sweetalert';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function OfferCard(data) {
    const navigate = useNavigate();

    const removeOF = async ({ id_user, id_product, notification, from }) => {
        await removeOffer({ id_user, id_product, notification, from });

        let newArrayOfOffers = [];

        data.offers.forEach((offer,index) => {
            if (index !== data.index) newArrayOfOffers.push(offer);
            if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
        });
    };

    const sendCounteroffer = () => {
        swal({
            title: 'Envie una contra oferta',
            text: 'Selecciona el monto que le gustaria tener para llegar a un acuerdo',
            content: {
                element: "input",
                attributes: {
                  placeholder: "Monto",
                  type: "number",
                },
              },
            button: 'Enviar'
        }).then((value) => {
            if (value === null) return 

            if (value) {
                if (/^[0-9]{0,20}$/.test(value)) {
                    makeCounteroffer({ from: cookies.get('id'), to: data.user_id, value, productId: data.product_id });
                    removeOF({ id_user: data.user_id, id_product: data.product_id, notification: false });

                    swal({
                        title: 'Enviado',
                        text: 'Contraoferta enviado con exito',
                        icon: 'success',
                        timer: '2000',
                        button: false,
                    });
                };
            };
        });
    };

    const sendMessage = (transmitter, receiver) => {
        swal({
            title: 'ESCRIBE EL MENSAJE',
            content: {
                element: "input",
                attributes: {
                  placeholder: "Mensaje",
                  type: "text",
                },
            },
            button: 'Enviar'
        }).then((value) => {
            if (value === null) return 

            if (value) {
                socket.emit('send_message',transmitter, receiver, value);

                swal({
                    title: 'Enviado',
                    text: 'Mensaje enviado con exito',
                    icon: 'success',
                    timer: '2000',
                    button: false,
                }).then(() => navigate('/messages'));
            };
        });
    };

    const accept = async () => {
        await acceptOffer({ from: cookies.get('id'), id_user: data.user_id, id_product: data.product_id });
        
        socket.emit('send_message',cookies.get('id'), data.user_id, `
            Hola soy el dueño del servicio ${data.productTitle}, me parece bien la oferta propuesta de ${data.offer}$ me gustaria
            llegar a un acuerdo con usted de como se haria realidad la implementacion del servicio propuesto.
        `);

        let newArrayOfOffers = [];

        data.offers.forEach((offer,index) => {
            if (index !== data.index) newArrayOfOffers.push(offer);
            if (index + 1 === data.offers.length) data.setOffers(newArrayOfOffers);
        })

        swal({
            title: 'Aceptado',
            text: '!Oferta aceptada con exito! se envio un mensaje automatico al usuario para preparar la conversacion sobre el servicio, puede ir a la mensajeria para hablar con el usuario.',
            icon: 'success',
            button: true,
        });
    };

    return (
        <div className="offer-container" key={data.key}>
            <div className="offer-information">
                <div className="offer-username">
                    <h3>{data.username}</h3>
                    <p>{data.name} {data.lastname}</p>
                </div>
                <h3 className="offer-value">{data.offer}$</h3>
            </div>
            <div className="post-control-options">
                <button title="Enviar mensaje" onClick={() => sendMessage(cookies.get('id'), data.user_id)}><i className="fas fa-envelope"></i></button>
                <button title="Hacer una contraoferta" onClick={() => sendCounteroffer()}><i className="fas fa-money-bill-alt"></i></button>
                <button title="Aceptar oferta" id="offer-check" onClick={() => accept()}><i className="fas fa-check"></i></button>
                <button title="Rechazar oferta" id="decline-offer" onClick={() => removeOF({ id_user: data.user_id, id_product: data.product_id, notification: true, from: cookies.get('id') })}><i className="fas fa-times-circle"></i></button>
            </div>
        </div>
    );
};

export default OfferCard;