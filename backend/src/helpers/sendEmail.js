const nodemailer = require('nodemailer');

module.exports = async (informationToSend) => {
    const transporter = nodemailer.createTransport({
        host: process.env.HOST_NODEMAILER,
        port: process.env.PORT_NODEMAILER,
        secure: process.env.SECURE_NODEMAILER,
        auth: {
            user: process.env.AUTH_USER_NODEMAILER,
            pass: process.env.AUTH_PASS_NODEMAILER
        },
        tls: {
            rejectUnauthorized: false //esto es para que en caso que no se envie del mismo dominio siga funcionando
        }
    });

    informationToSend.from = `'Penssum' <${process.env.AUTH_USER_NODEMAILER}>`;

    try { 
        const information = await transporter.sendMail(informationToSend); 
        console.log('email sent: ', information.messageId);
        return information;
    } catch (e) { 
        console.log(e.message) 
        return { error: true };
    };
};