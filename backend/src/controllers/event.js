const path = require('path');
const fs = require('fs-extra');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Block = require('../models/Block');
const Product = require('../models/Product');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Transaction = require('../models/Transaction');
const Vote = require('../models/Vote');

const { randomName } = require('../helpers/libs');

const ctrl = {};

ctrl.getNotifications = async (req, res) => {
    const { id } = req.body;

    const currentBlock = await Block.find({ from: id });

    if (currentBlock.length > 0) {
        const blockId = [];
        currentBlock.forEach(block => blockId.push({ from: { $ne: block.to } }));
        const notifications = await Notification.find({ 
            to: id,
            $or: currentBlock 
        }).sort({ creationDate: -1 });
        return res.send(notifications);
    } else {
        const notifications = await Notification.find({ to: id }).sort({ creationDate: -1 });
        return res.send(notifications);
    };
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
    const { from, userToReport, description, files, post_id } = req.body;

    try {
        if (files !== null && files !== undefined) {
            files.forEach(async file => {
                file.url = `${process.env.API_PENSSUM}/report/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/report/${file.fileName}`);
            });
        };
    } catch (e) { console.log(e) };

    const user = await User.findById(from);

    const newNotification = new Notification({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        from,
        to: 'Admin',
        title: 'Has recibido un reporte',
        description: `El usuario ${user.username} te ha enviado un reporte de ${userToReport} ${post_id !== null ? `a la publicacion con id ${post_id},` : ''} el usuario que ha reportado dijo: ${description}`,
        color: 'yellow',
        files: (files !== null && files !== undefined) ? files : [],
        image: user.profilePicture
    });

    await newNotification.save();

    res.send('Report sent');
};

ctrl.sendInformationAdmin = async (req,res) => {
    const { from, mainTitle, words, color, title, description, files } = req.body;

    try {
        if (files !== null && files !== undefined) {
            files.forEach(async file => {
                file.url = `${process.env.API_PENSSUM}/improvementComment/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/improvementComment/${file.fileName}`);
            });
        };
    } catch (e) { console.log(e) };

    const user = await User.findById(from);

    const newNotification = new Notification({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        from,
        to: 'Admin',
        title: mainTitle,
        description: `El usuario ${user.username} te ha enviado ${words} ${title} el usuario a enviado lo siguiente: ${description}`,
        color,
        files: (files !== null && files !== undefined) ? files : [],
        image: user.profilePicture
    });

    await newNotification.save();

    res.send('Information sent');
};

ctrl.suspensionControl = async (req,res) => {
    const { id } = req.body;

    const user = await User.findById(id);

    if (user) {
        if (user.typeOfUser.user === 'layoff') {
            const userDate = new Date(user.typeOfUser.suspension);
            const nowDate = new Date();

            if (userDate.getTime() < nowDate.getTime()) {
                User.findByIdAndUpdate(id, { 'typeOfUser.user': 'free', 'typeOfUser.suspension': null });
            };
        };
    };

    res.send('checked');
};

ctrl.transactions = async (req,res) => {
    const { userID, checkVerification, post_id } = req.body;

    if (checkVerification) {
        const transaction = await Transaction.findOne({ userId: checkVerification, productId: post_id, verification: true });

        if (transaction) return res.send(transaction)
        else return res.send({ error: true, type: 'There are no transaction' });
    };

    if (userID === undefined ) {
        const transactions = await Transaction.find().sort({ creationDate: -1 });

        const newTransactions = []

        if (transactions.length > 0) {
            transactions.forEach(async (transaction,index) => {
                const user = await User.findById(transaction.advance || transaction.verification ? transaction.userId : transaction.ownerId);

                const newTransaction = {
                    ...transaction._doc,
                    username: user.username,
                    bank: user ? user.bankData.bank : '',
                    accountNumber: user ? user.bankData.accountNumber : '',
                    accountType: user ? user.bankData.accountType : ''
                }

                newTransactions.push(newTransaction);

                if (index + 1 === transactions.length) setTimeout(() => res.send(newTransactions),2000);
            });
        } else res.send(transactions);
    } else {
        const transactions = await Transaction.find({ ownerId: userID });

        if (transactions.length > 0) {
            let amount = 0;

            transactions.forEach(transaction => amount += transaction.amount);

            res.send({ amount });
        } else res.send({ error: true, type: 'There are no transaction' });
    };
};

ctrl.removeTransaction = async (req,res) => {
    const { id, id_user, amount, advance, verification, files } = req.body;

    await Transaction.findByIdAndRemove(id);

    files.forEach(async file => {
        try { await fs.unlink(path.resolve(`src/public/report/${file.fileName}`)); } catch (e) { console.log(e) };
    });

    if (!advance) {
        try {
            const user = await User.findById(id_user); 

            const newNotification = new Notification({
                username: 'Admin',
                from: 'Admin',
                to: id_user,
                title: `Admin (PAGO)`,
                description: `${user.username} has recibido el pago de $${amount} (COP)`,
                color: 'green',
                image: 'admin'
            });

            await newNotification.save();
        } catch(e) { console.log(e) }
    };

    if (verification) {
        await Product.findByIdAndUpdate(verification,{ advancePayment: true, paymentTOKEN: null, paymentLink: null });

        try {
            const user = await User.findById(id_user); 

            const newNotification = new Notification({
                username: 'Admin',
                from: 'Admin',
                to: id_user,
                title: `Admin (VERIFICACION DE PAGO)`,
                description: `${user.username} tu verificacion de pago fue exitosa a un monto de $${amount} (COP) ya puedes disfrutar de tu publicacion con el titulo de PAGO VERIFICADO`,
                color: 'green',
                image: 'admin',
                productId: verification
            });

            await newNotification.save();
        } catch(e) { console.log(e) };
    };

    res.send('Removed');
};

ctrl.getVote = async (req,res) => {
    const { from, to, productId, voteType } = req.body;

    if (voteType === 'pending') {
        const votes = await Vote.find({ from, pending: true });

        if (votes) {
            const users = [];

            votes.forEach(async (vote,index) => {
                const user = await User.findById(vote.to);
                users.push(user);
                if (index+1 === votes.length) res.send(users);
            });
        } else res.send({ error: true, type: 'Vote pending not found' });
        return
    };

    if (voteType === 'product') {
        const productVote = await Vote.findOne({ 
            $or: [
                { from, to },
                { from: to, to: from }
            ] 
        });
        if (productVote) res.send(productVote)
        else res.send({ error: true, type: 'vote not found' });
        return
    };

    if (voteType === 'user') {
        const userVotes = await Vote.find({ to, pending: false });

        if (userVotes) {
            let generalVotes = 0;

            userVotes.forEach((userVote,index) => {
                generalVotes += userVote.vote;

                if (index + 1 === userVotes.length) generalVotes = (generalVotes / userVotes.length);
            });

            res.send({ votes: generalVotes, count: userVotes.length });
        } else res.send({ votes: 0 });

        return
    };

    res.send('voteType not defined');
};

ctrl.vote = async (req,res) => {
    const { from, to, productId, vote, pending } = req.body;

    const searchVote = await Vote.findOne({ from, to/*, productId*/ });

    if (searchVote && !searchVote.pending && !pending) {
        res.send('Vote already made');
        /*if (vote === 0) {
            await Vote.findByIdAndDelete(searchVote);
            res.send('vote removed');
        } else {
            await Vote.findByIdAndUpdate(searchVote._id, { vote });
            res.send('Vote Updated'); 
        };*/
    } else {
        if (pending) {
            const result = await Vote.findByIdAndUpdate(searchVote._id, { pending: false, vote });
            res.send(result);
        } else if (vote !== 0) {
            const newVote = new Vote({ from, to, productId, vote });
            const result = await newVote.save();

            const newVoteOpposingUser = new Vote({ from: to, to: from, productId, pending: true });
            await newVoteOpposingUser.save();

            res.send(result);
        } else res.send('The vote is 0'); 
    };
};

ctrl.rejectVote = async (req,res) => {
    const { from, to, remove } = req.body;

    const searchVote = await Vote.findOne({ from, to });

    if ((searchVote && remove) || (searchVote && searchVote.rejection >= 4)) {
        await Vote.findByIdAndDelete(searchVote._id);
        return res.send('Vote removed');
    } else if (searchVote) {
        await Vote.findByIdAndUpdate(searchVote._id,{ rejection: searchVote.rejection + 1 });
        res.send('Change rejection');
    } else res.send("vote not found");
};

ctrl.sendTransactionVerification = async (req,res) => {
    const { userID, post_id, amount, files } = req.body;

    const product = await Product.findById(post_id);

    try {
        if (files !== null && files !== undefined) {
            files.forEach(async file => {
                file.url = `${process.env.API_PENSSUM}/report/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/report/${file.fileName}`);
            });
        };
    } catch (e) { console.log(e) };

    const newTransaction = new Transaction({
        userId: userID,
        productTitle: product.title,
        productId: post_id,
        amount,
        verification: true,
        files: (files !== null && files !== undefined) ? files : []
    });

    const result = await newTransaction.save();

    res.send(result);
};

module.exports = ctrl;