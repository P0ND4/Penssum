const path = require('path');
const fs = require('fs-extra');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Block = require('../models/Block');
const Product = require('../models/Product');
const User = require('../models/User');
const Offer = require('../models/Offer');

const ctrl = {};

ctrl.getNotifications = async (req, res) => {
    const { id } = req.body;
    const notifications = await Notification.find({ to: id }).sort({ creationDate: -1 });
    res.send(notifications);
};

ctrl.revisedNotification = async (req, res) => {
    const { id } = req.body;
    await Notification.updateMany({ to: id }, { view: true });
    res.send('notification Checked');
};

ctrl.getUncheckedMessages = async (req, res) => {
    const { id } = req.body;

    const uncheckedMessages = await Message.find({
        receiver: id,
        view: false
    });

    res.send(uncheckedMessages);
};

ctrl.revisedMessages = async (req, res) => {
    const { id } = req.body;
    await Message.updateMany({
        receiver: id,
    }, { view: true });
    res.send('messages Checked');
};

ctrl.block = async (req, res) => {
    try {
        const { from, to } = req.body;

        const newBlock = new Block({ from, to });
        const result = await newBlock.save();

        const products = await Product.find({ owner: to });

        if (products.length > 0) {
            const productsToRemoveOffer = [];

            products.forEach(product => productsToRemoveOffer.push({ product: product._id }));
            await Offer.deleteMany({ user: from, $or: productsToRemoveOffer });
        };

        const userNotifications = await Notification.find({ to: from });

        if (userNotifications.length > 0) {
            userNotifications.forEach(notification => {
                const files = notification.files;
                files.forEach(async file => {
                    console.log(file.fileName);
                    try { await fs.unlink(path.resolve(`src/public/quotes/${file.fileName}`)) } catch(e) {console.log('Image not found') };
                });
            });
        };

        await Notification.deleteMany({ $or: [{ from, to },{ from: to, to: from }] });

        const user = await User.findById(from);

        const newNotification = await Notification({
            username: user.username,
            from,
            to,
            title: 'Te han bloqueado',
            description: `${user.username} Te ha bloqueado, no puedes ver sus publicaciones, enviarle mensajes, entrar a videollamadas, enviar cotizaciones, entre otras funcionalidades.`,
            color: 'orange',
            image: user.profilePicture
        });

        await newNotification.save();

        res.send(result);
    } catch (e) { res.send({ error: true, type: e.message }) };
};

ctrl.reviewBlocked = async (req, res) => {
    try {
        const { from, to, product } = req.body;

        if (product) {
            const product = await Product.findById(to);
            const owner = await User.findById(product.owner);

            const currentBlock = await Block.find({
                $or: [
                    { from, to: owner._id },
                    { from: owner._id, to: from }
                ]
            });

            res.send(currentBlock);
        } else {
            const currentBlock = await Block.find({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            });

            res.send(currentBlock);
        };
    } catch (e) { res.send({ error: true, type: e.message }) };
};

ctrl.removeBlock = async (req, res) => {
    try {
        const { from, to } = req.body;

        const currentBlock = await Block.find({
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        });

        let user;

        if (currentBlock[0].from === from) { user = await User.findById(from); }
        else { user = await User.findById(to); }

        const newNotification = await Notification({
            username: user.username,
            from,
            to,
            title: 'Te han desbloqueado',
            description: `${user.username} Te ha desbloqueado, ya puedes ver sus publicaciones, enviarle mensajes, entrar a videollamadas, enviar cotizaciones, entre otras funcionalidades.`,
            color: 'blue',
            image: user.profilePicture
        });

        await newNotification.save();

        await Block.deleteMany({
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        });

        res.send('Deleted block');
    } catch (e) { console.log(e) }
};

ctrl.report = async (req, res) => {
    const { from, userToReport, description, files } = req.body;

    try {
        if (files !== null && files !== undefined) {
            files.forEach(async file => {
                file.url = `http://localhost:8080/report/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/report/${file.fileName}`);
            });
        };
    } catch (e) { console.log(e) };

    const user = await User.findById(from);

    const newNotification = new Notification({
        username: user.username,
        from,
        to: 'Admin',
        title: 'Has recibido un reporte',
        description: `${user.username} te ha enviado un reporte de ${userToReport} el usuario que ha reportado dijo: ${description}`,
        color: 'yellow',
        image: user.profilePicture
    });

    await newNotification.save();

    res.send('Report sent');
};

module.exports = ctrl;