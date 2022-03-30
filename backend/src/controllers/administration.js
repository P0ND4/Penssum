const Administration = require('../models/Administration');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');

const hash = require('../helpers/hash');

const ctrl = {};

ctrl.main = async (req, res) => {
    const result = await Administration.find();
    if (result.length === 0) {
        const password = await hash.scryptPassword('penssum');

        const createAdministration = new Administration({ firstPassword: password, secondPassword: password });
        const result = createAdministration.save();
        res.send(result);
    } else {
        await Administration.findByIdAndUpdate(result[0]._id, { views: result[0].views + 1 });
        res.send(result[0]);
    };
};

ctrl.checkAdminInformation = async (req, res) => {
    const { security, data } = req.body;

    const administrationInformation = await Administration.find();

    if (security === 1) {
        if (data.email === administrationInformation[0].firstEmail) {
            const match = await hash.matchPassword(data.password,administrationInformation[0].firstPassword);

            if (match) res.send({ error: null, type: 'correct data' })
            else res.send({ error: true, type: 'wrong password' })
        } else res.send({ error: true, type: 'wrong email' });
    } else if (security === 2) {
        if (data.email === administrationInformation[0].secondEmail) {
            const match = await hash.matchPassword(data.password,administrationInformation[0].secondPassword);

            if (match) {
                if (administrationInformation[0].keyword === data.keyword) {
                    res.send({ error: null, type: 'correct data' });
                } else res.send({ error: true, type: 'wrong keyword' })
            } else res.send({ error: true, type: 'wrong password' })
        } else res.send({ error: true, type: 'wrong email' });
    }
};

ctrl.dashboard = async (req, res) => {
    const administration = await Administration.find();

    const mainInformation = {
        totalUsers: 0,
        totalProducts: 0,
        productsToReview: 0,
        reports: 0,
        concreteOffers: 0,
        registeredUsers: [0, 0, 0, 0, 0, 0, 0],
        currentProducts: [0, 0, 0, 0, 0, 0, 0],
        lastProducts: [0, 0, 0, 0, 0, 0, 0],
        usersStatus: [0, 0, 0],
        totalViews: administration[0].views,
        firstEmail: administration[0].firstEmail,
        firstPassword: administration[0].firstPassword,
        secondEmail: administration[0].secondEmail,
        secondPassword: administration[0].secondPassword,
        keyword: administration[0].keyword,
        name: administration[0].name
    };

    const users = await User.find();
    mainInformation.totalUsers = users.length;

    const reports = await Notification.find({ to: 'Admin', view: false });
    mainInformation.reports = reports.length;

    const totalOffers = await Offer.find({ acceptOffer: true });
    mainInformation.concreteOffers = totalOffers.length;

    const currentUsersStatus = [0, 0, 0];

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.typeOfUser.user === 'free') currentUsersStatus[0] += 1;
        if (user.typeOfUser.user === 'discontinued') currentUsersStatus[1] += 1;
        if (user.typeOfUser.user === 'locked') currentUsersStatus[2] += 1;

        if (i + 1 === users.length) mainInformation.usersStatus = currentUsersStatus;
    };

    const calculateDate = (discountDays, sendingData) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - discountDays);
        if (sendingData === 'dateInText') return `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`
        else if (sendingData === 'date') return currentDate;
    };

    const minimumDateToSearchUser = calculateDate(7, 'date');

    const usersOfTheWeek = await User.find({ creationDate: { $gte: minimumDateToSearchUser } });

    const registeredUsers = {
        date: [
            calculateDate(0, 'dateInText'),
            calculateDate(1, 'dateInText'),
            calculateDate(2, 'dateInText'),
            calculateDate(3, 'dateInText'),
            calculateDate(4, 'dateInText'),
            calculateDate(5, 'dateInText'),
            calculateDate(6, 'dateInText')
        ],
        users: [0, 0, 0, 0, 0, 0, 0]
    };

    for (let i = 0; i < usersOfTheWeek.length; i++) {
        const day = usersOfTheWeek[i].creationDate.getDate();
        const month = usersOfTheWeek[i].creationDate.getMonth() + 1;
        const year = usersOfTheWeek[i].creationDate.getFullYear();

        const currentRegisteredUsers = registeredUsers.date.indexOf(`${day}-${month}-${year}`)

        if (currentRegisteredUsers !== -1) registeredUsers.users[currentRegisteredUsers] += 1
        else console.log('The User does not belong to any date');

        if (i + 1 === usersOfTheWeek.length) mainInformation.registeredUsers = registeredUsers.users;
    };

    const productsActivated = await Product.find({ stateActivated: true });
    mainInformation.totalProducts = productsActivated.length;

    const productsToReview = await Product.find({ stateActivated: false });
    mainInformation.productsToReview = productsToReview.length;

    const searchByDate = calculateDate(14, 'date');

    const currentProducts = {
        date: [
            calculateDate(0, 'dateInText'),
            calculateDate(1, 'dateInText'),
            calculateDate(2, 'dateInText'),
            calculateDate(3, 'dateInText'),
            calculateDate(4, 'dateInText'),
            calculateDate(5, 'dateInText'),
            calculateDate(6, 'dateInText')
        ],
        products: [0, 0, 0, 0, 0, 0, 0]
    };

    const lastProducts = {
        date: [
            calculateDate(7, 'dateInText'),
            calculateDate(8, 'dateInText'),
            calculateDate(9, 'dateInText'),
            calculateDate(10, 'dateInText'),
            calculateDate(11, 'dateInText'),
            calculateDate(12, 'dateInText'),
            calculateDate(13, 'dateInText')
        ],
        products: [0, 0, 0, 0, 0, 0, 0]
    };

    const latestProducts = await Product.find({ creationDate: { $gte: searchByDate } });

    for (let i = 0; i < latestProducts.length; i++) {
        const day = latestProducts[i].creationDate.getDate();
        const month = latestProducts[i].creationDate.getMonth() + 1;
        const year = latestProducts[i].creationDate.getFullYear();

        const currentDateToCompare = currentProducts.date.indexOf(`${day}-${month}-${year}`);
        const lastDateToCompare = lastProducts.date.indexOf(`${day}-${month}-${year}`);

        if (currentDateToCompare !== -1) currentProducts.products[currentDateToCompare] += 1
        else if (lastDateToCompare !== -1) lastProducts.products[lastDateToCompare] += 1
        else console.error('The Product does not belong to any date');

        if (i + 1 === latestProducts.length) {
            mainInformation.lastProducts = lastProducts.products;
            mainInformation.currentProducts = currentProducts.products;
        };
    };

    res.send(mainInformation);
};

ctrl.changePreferenceValue = async (req, res) => {
    const { name, value } = req.body;

    const administration = await Administration.find();
    await Administration.findByIdAndUpdate(administration[0]._id, { [name]: value });

    res.send('updated');
};

ctrl.changePassword = async (req, res) => {
    const { typePassword, password, newPassword } = req.body;

    const administrationInformation = await Administration.find();

    if (typePassword === 1) {
        const match = await hash.matchPassword(password, administrationInformation[0].firstPassword);

        if (match) {
            const encryptedPassword = await hash.scryptPassword(newPassword);
            await Administration.findByIdAndUpdate(administrationInformation[0]._id, { firstPassword: encryptedPassword });
            return res.send({ error: null, type: 'First password changed' });
        } else return res.send({ error: true, type: 'Invalid password' });
    } else if (typePassword === 2) {
        const match = await hash.matchPassword(password, administrationInformation[0].secondPassword);

        if (match) {
            const encryptedPassword = await hash.scryptPassword(newPassword);
            await Administration.findByIdAndUpdate(administrationInformation[0]._id, { secondPassword: encryptedPassword });
            return res.send({ error: null, type: 'Second password changed' });
        } else return res.send({ error: true, type: 'Invalid password' });
    };
};

module.exports = ctrl;