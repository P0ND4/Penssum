const path = require('path');
const fs = require('fs-extra');

const User = require('../models/User');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Message = require('../models/Message');
const Block = require('../models/Block');
const Notification = require('../models/Notification');
const Vote = require('../models/Vote');
const Transaction = require('../models/Transaction');

const { randomName } = require('../helpers/libs');
const hash = require('../helpers/hash');
const sendEmail = require('../helpers/sendEmail');

const ctrl = {};

ctrl.users = async (req, res) => {
    const users = await User.find();
    res.send(users);
};

ctrl.get = async (req, res) => {
    const { id, username, email } = req.body;

    if (id) {
        const user = await User.findById(id);
        return res.send(user);
    } else if (username) {
        const user = await User.findOne({ username });
        if (!user) return res.send({ error: true, type: 'user not found for username' });
        return res.send(user);
    } else if (email) {
        const user = await User.findOne({ email });
        if (!user) return res.send({ error: true, type: 'user not found for email' });
        return res.send(user);
    } else {
        res.send({ error: true, type: 'There are no data' });
    };
};

ctrl.signin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.send({ error: true, type: 'User not found' });
    } else {
        const match = await hash.matchPassword(password, user.password);

        if (match) return res.send(user);
        else return res.send({ error: true, type: 'Invalid password' });
    };
};

ctrl.signup = async (req, res) => {
    const userData = req.body;
    userData.stringToCompare = userData.username.toLowerCase();

    const newUser = new User(userData);

    const user = await User.findOne({ stringToCompare: newUser.stringToCompare });
    const email = await User.findOne({ email: newUser.email });

    const error = {
        user: false,
        email: false
    }

    if (user) { error.user = true };
    if (email) { error.email = true };

    if (error.user === false && error.email === false) {
        newUser.password = await hash.scryptPassword(newUser.password);
        const result = await newUser.save();
        return res.send(result);
    } else { return res.send({ error: true, type: error }) };
};

ctrl.accountAuthentication = async (req, res) => {
    const data = req.body;
    await User.findByIdAndUpdate(data.id, { objetive: data.objetive, validated: data.validated });

    if (data.validated) {
        const updatedUser = await User.findById(data.id);
        return res.send(updatedUser)
    } else {
        const TOKEN = randomName(100);
        await User.findByIdAndUpdate(data.id, { token: TOKEN });

        const updatedUser = await User.findById(data.id);

        const contentHTML = `
            <div style="width: 100%; margin: 0;" >
                <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;"/>
                <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 18px; color: #666;">Muchas gracias por registrarte en Penssum, por favor confirma tu cuenta como ${updatedUser.username}</p>
                <div style="width: 100%; text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_PENSSUM}/signup/email/verification/${TOKEN}" style="text-decoration: none;">
                        <button style="border: none; outline: none; border-radius: 40px; padding: 8px 20px; font-size: 18px; font-family: sans-serif; background: #3282B8; color: #FFF; cursor: pointer;">Confirmar</button>
                    </a>
                    <p style="color: #666; font-size: 16px; margin: 8px 0;">Si no funciona el boton presiona <a href="http://localhost:3000/signup/email/verification/${TOKEN}" style="color: #3282B8;">Aqui</a></p>
                </div>
                <p style="display: block; width: 90%; margin: 0 auto; color: #666; font-size: 16px; text-align: center;">Si no fuiste tu, puedes ignorar este correo. Este correo es un correo automatizado de nuestra plataforma Penssum Lee nuestros terminos y condiciones de uso de nuestra aplicacion. <a href="http://localhost:3000/help/information/mod=terms_and_conditions" style="color: #3282B8;">Terminos y condiciones</a></p>
            </div>
        `

        const informationToSend = {
            to: updatedUser.email,
            subject: `Confirma tu cuenta de Penssum como ${updatedUser.username}`,
            html: contentHTML,
            attachments: [{
                filename: 'penssum-transparent.png',
                path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
                cid: 'penssum'
            }]
        };

        await sendEmail(informationToSend);

        return res.send(updatedUser);
    };
};

ctrl.tokenVerification = async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ token });

    if (user) {
        await User.findByIdAndUpdate(user._id, { token: null, validated: true });
        const updateUser = await User.findById(user._id);

        return res.send(updateUser);
    } else return res.send({ error: true, type: 'Invalid token' });
};

ctrl.delete = async (req, res) => {
    const { id } = req.body;

    const user = await User.findById(id);
    const userNotifications = await Notification.find({ to: id });
    const products = await Product.find({ owner: id });

    products.forEach(async product => {
        try { await fs.unlink(path.resolve(`src/public/optimize/${product.miniature}`)); } catch (e) { console.log('Image not found') };
    });

    if (user.profilePicture !== null) {
        try { await fs.unlink(path.resolve(`src/public/user/${user.userImageFileName.profilePicture}`)) } catch (e) { console.log('Image not found') };
    };

    if (user.coverPhoto !== null) {
        try { await fs.unlink(path.resolve(`src/public/user/${user.userImageFileName.coverPhoto}`)) } catch (e) { console.log('Image not found') };
    };

    if (userNotifications.length > 0) {
        userNotifications.forEach(notification => {
            const files = notification.files;
            files.forEach(async file => {
                try { await fs.unlink(path.resolve(`src/public/quotes/${file.fileName}`)) } catch (e) { console.log('Image not found') };
            });
        });
    };

    await Offer.deleteMany({ user: id });
    await Product.deleteMany({ owner: id });
    await Block.deleteMany({ $or: [{ from: id }, { to: id }] });
    //await Message.deleteMany({ $or: [{ transmitter: id }, { receiver: id }] });
    await Notification.deleteMany({ to: id });
    await Transaction.findOneAndDelete({ ownerId: id });
    await Vote.findOneAndDelete({ from: id });
    await User.findByIdAndDelete(id);

    res.send('User delete successfully');
};

ctrl.changeMail = async (req, res) => {
    const { id, username, email } = req.body;

    const emailDB = await User.findOne({ email });

    if (emailDB) return res.send({ error: true, type: 'email in use' })
    else {
        const TOKEN = randomName(100);

        await User.findByIdAndUpdate(id, { email, token: TOKEN });

        const contentHTML = `
            <div style="width: 100%; margin: 0;" >
                <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;" />
                <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 22px; color: #666;">Muchas gracias por registrarte en Penssum, por favor confirma tu cuenta como ${username}</p>
                <div style="width: 100%; text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_PENSSUM}/signup/email/verification/${TOKEN}" style="text-decoration: none;">
                        <button style="border: none; outline: none; border-radius: 40px; padding: 8px 20px; font-size: 22px; font-family: sans-serif; background: #3282B8; color: #FFF; cursor: pointer;">Confirmar</button>
                    </a>
                    <p style="color: #666; font-size: 18px; margin: 8px 0;">Si no funciona el boton presiona <a href="${process.env.FRONTEND_PENSSUM}/signup/email/verification/${TOKEN}" style="color: #3282B8;">Aqui</a></p>
                </div>
                <p style="display: block; width: 90%; margin: 0 auto; color: #666; font-size: 18px; text-align: center;">Si no fuiste tu, puedes ignorar este correo. Este correo es un correo automatizado de nuestra plataforma Penssum Lee nuestros terminos y condiciones de uso de nuestra aplicacion. <a href="${process.env.FRONTEND_PENSSUM}/help/information/mod=terms_and_conditions" style="color: #3282B8;">Terminos y condiciones</a></p>
            </div>
        `

        const informationToSend = {
            to: email,
            subject: `Confirma tu cuenta de Penssum como ${username}`,
            html: contentHTML,
            attachments: [{
                filename: 'penssum-transparent.png',
                path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
                cid: 'penssum'
            }]
        };

        const result = await sendEmail(informationToSend);
        const user = await User.findById(id);

        return res.send({ message: result, user });
    }
};

ctrl.recoveryPassword = async (req,res) => {
    const { userInformation } = req.body;

    const CODE = randomName(6, { Number: true });

    const contentHTML = `
        <div style="width: 100%; margin: 0;" >
            <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;" />
            <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 22px; color: #666;">
                Hola, ${userInformation.firstName !== '' ? userInformation.firstName : userInformation.username}: <br/><br/>
                Hemos recibido una solicitud para modificar la contraseña de Penssum.
                Introduce el siguiente codigo para restablecer la contraseña: <br/><br/>
                <div style="display: block; text-align: center;">
                    <div style="display: inline-block; padding: 0 20px; border-radius: 12px; border: 1px solid #0F4C75; background: #3282B822;">
                        <p style="font-size: 16px;"><b>${CODE}</b></p>
                    </div>
                </div>
            </p>
            <p style="display: block; width: 90%; margin: 0 auto; color: #666; font-size: 18px; text-align: center;"><b>¿No has pedido este cambio?</b><br/> Si no has solicitado una nueva contraseña, <a href="${process.env.FRONTEND_PENSSUM}/help" style="color: #3282B8;">Informarnos</a>.</p>
        </div>
    `

    const informationToSend = {
        to: userInformation.email,
        subject: `${CODE} es el codigó de recuperación de tu cuenta de Penssum`,
        html: contentHTML,
        attachments: [{
            filename: 'penssum-transparent.png',
            path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
            cid: 'penssum'
        }]
    };

    const result = await sendEmail(informationToSend);

    res.send({ code: CODE, message: result });
};

ctrl.changePreferenceValue = async (req, res) => {
    const { id, name, value } = req.body;

    if (name === 'subjects' || name === 'topics') {
        const valueChanged = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (name === 'subjects') await User.findByIdAndUpdate(id, { 'specialty.subjects': valueChanged });
        if (name === 'topics') await User.findByIdAndUpdate(id, { 'specialty.topics': valueChanged });
    };

    await User.findByIdAndUpdate(id, { [name]: value });
    const updatedUser = await User.findById(id);

    res.send(updatedUser);
};

ctrl.changePassword = async (req, res) => {
    const { id, password, newPassword, isForgot } = req.body;

    const user = await User.findById(id);
    const match = await hash.matchPassword(password, user.password);

    if (match || isForgot) {
        const encryptedPassword = await hash.scryptPassword(newPassword);
        await User.findByIdAndUpdate(id, { password: encryptedPassword });
        const userUpdated = await User.findById(id);
        return res.send(userUpdated);
    } else return res.send({ error: true, type: 'Invalid password' });
};

ctrl.search = async (req, res) => {
    let { id, search, filterNav } = req.body;

    const removeData = {
        email: false,
        password: false,
        stringToCompare: false,
        identification: false,
        phoneNumber: false,
        availability: false,
        virtualClasses: false,
        showMyNumber: false,
        typeOfUser: false,
        validated: false,
        token: false,
        secondName: false,
        secondSurname: false,
        registered: false,
        yearsOfExperience: false,
        faceToFaceClasses: false
    };

    search = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const dataToSearch = {
        _id: { $ne: id },
        description: { $ne: '' },
        validated: true,
        'typeOfUser.user': { $ne: 'block' },
        objetive: 'Profesor',
        $or: [
            { firstName: { $regex: '.*' + search + '.*', $options: 'im' } },
            { secondName: { $regex: '.*' + search + '.*', $options: 'im' } },
            { lastName: { $regex: '.*' + search + '.*', $options: 'im' } },
            { secondSurname: { $regex: '.*' + search + '.*', $options: 'im' } },
            { username: { $regex: '.*' + search + '.*', $options: 'im' } },
            { faculties: { $regex: '.*' + search + '.*', $options: 'im' } },
            { 'specialty.subjects': { $regex: '.*' + search + '.*', $options: 'im' } },
            { 'specialty.topics': { $regex: '.*' + search + '.*', $options: 'im' } },
            { email: search }
        ]
    };

    if (filterNav.city !== 'ciudad') dataToSearch.city = filterNav.city;
    if (filterNav.classType !== 'classType') {
        if (filterNav.classType === 'virtual') dataToSearch.virtualClasses = true;
        if (filterNav.classType === 'presencial') dataToSearch.faceToFaceClasses = true;
    };

    const users = await User.find(dataToSearch, removeData).limit(50).sort({ completedWorks: -1 });

    (users.length > 0 && search.length >= 2)
        ? res.send(users)
        : res.send({ error: true, type: 'users not found' });
};

ctrl.findAllUsers = async (req, res) => {
    const { search } = req.body;

    const users = await User.find({
        $or: [
            { firstName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { secondName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { lastName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { secondSurname: { $regex: '.*' + search + '.*', $options: 'i' } },
            { username: { $regex: '.*' + search + '.*', $options: 'i' } },
            { email: search }
        ]
    });

    (users.length > 0)
        ? res.send(users)
        : res.send({ error: true, type: 'users not found' });
}

ctrl.changePhoto = async (req, res) => {
    const { photoType, id, oldPhoto } = req.body;
    const file = req.file;

    const validateFile = async () => {
        const URLFile = randomName(15);
        if (fs.existsSync(`src/public/user/${URLFile}`)) validateFile()
        else {
            const fileAddress = file.path;
            const extname = path.extname(file.originalname).toLocaleLowerCase();
            const targetPath = path.resolve(`src/public/user/${URLFile}${extname}`);

            const filesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;

            if (filesAllowed.test(extname) && filesAllowed.test(file.mimetype)) {
                try { await fs.unlink(`src/public/user/${oldPhoto.slice(-21)}`); }
                catch (e) { console.log('Image not found') };

                await fs.rename(fileAddress, targetPath);
                const url = `${process.env.API_PENSSUM}/user/${URLFile + extname}`;
                await User.findByIdAndUpdate(id, (photoType === 'profile')
                    ? { profilePicture: url, 'userImageFileName.profilePicture': URLFile + extname }
                    : (photoType === 'cover') ? { coverPhoto: url, 'userImageFileName.coverPhoto': URLFile + extname } : {});
                res.send({
                    fileName: URLFile + extname,
                    uniqueId: URLFile,
                    extname,
                    url
                });
            } else {
                await fs.unlink(fileAddress);
                res.send({ type: 'Format invalid', error: true, data: extname })
            };
        };
    };
    validateFile();
};

ctrl.completeInformation = async (req,res) => {
    const { id, data } =  req.body;

    await User.findByIdAndUpdate(id,data);
    const userUpdated = await User.findById(id);

    res.send(userUpdated);
};

module.exports = ctrl;