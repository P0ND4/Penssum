const nodemailer = require('nodemailer');

module.exports = async (username,email,token) => {
    contentHTML = `
        <h1>Verification</h1>
        <p>we need What you confirm you count as ${username} for to avoid emails false, Here are you data</p>
        <a href="http://localhost:3000/signup/email/verification/${token}">Click aqui para confirmar tu cuenta</a>
    `;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'melvincolmenares.m@gmail.com',
            pass: 'fytwgmygdiolvsvl'
        },
        /*tls: {
            rejectUnauthorized: false //esto es para que en caso que no se envie del mismo dominio siga funcionando
        },*/
    });

    const information = await transporter.sendMail({
        from: "'Protech' <melvincolmenares.m@gmail.com>",
        to: email,
        subject: "Confirma tu cuenta de Protech",
        html: contentHTML
    }, (error,info) => {
        if (error) return error;
        else return info;
    });

    return information;
};