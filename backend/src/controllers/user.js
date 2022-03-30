const path = require('path');
const fs = require('fs-extra');

const User = require('../models/User');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Message = require('../models/Message');
const Block = require('../models/Block');
const Notification = require('../models/Notification'); 

const { randomName } = require('../helpers/libs');
const hash = require('../helpers/hash');
const sendEmail = require('../helpers/sendEmail');

const ctrl = {};

ctrl.users = async (req, res) => {
    const users = await User.find();
    res.send(users);
};

ctrl.get = async (req, res) => {
    const { id, username } = req.body;

    if (id) {
        const user = await User.findById(id);
        return res.send(user);
    } else if (username) {
        const user = await User.findOne({ username });
        if (!user) return res.send({ error: true, type: 'user not found for id and username' });
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
        await sendEmail(updatedUser.username, updatedUser.email, TOKEN);

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
        try { await fs.unlink(path.resolve(`src/public/user/${user.userImageFileName.profilePicture}`)) } catch(e) { console.log('Image not found') };
    };

    if (user.coverPhoto !== null) { 
        try { await fs.unlink(path.resolve(`src/public/user/${user.userImageFileName.coverPhoto}`)) } catch(e) {console.log('Image not found') };
    };

    if (userNotifications.length > 0) {
        userNotifications.forEach(notification => {
            const files = notification.files;
            files.forEach(async file => {
                try { await fs.unlink(path.resolve(`src/public/quotes/${file.fileName}`)) } catch(e) {console.log('Image not found') };
            });
        });
    };

    await Offer.deleteMany({ user: id });
    await Product.deleteMany({ owner: id });
    await Block.deleteMany({ $or: [{ from: id }, { to: id }] });
    await Message.deleteMany({ $or: [{ transmitter: id }, { receiver: id }] });
    await Notification.deleteMany({ to: id });
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
        await sendEmail(username, email, TOKEN);

        const user = await User.findById(id);

        return res.send(user);
    }
};

ctrl.changePreferenceValue = async (req, res) => {
    const { id, name, value } = req.body;

    await User.findByIdAndUpdate(id, { [name]: value });
    const updatedUser = await User.findById(id);

    res.send(updatedUser);
};

ctrl.changePassword = async (req, res) => {
    const { id, password, newPassword } = req.body;

    const user = await User.findById(id);
    const match = await hash.matchPassword(password, user.password);

    if (match) {
        const encryptedPassword = await hash.scryptPassword(newPassword);
        await User.findByIdAndUpdate(id, { password: encryptedPassword });
        const userUpdated = await User.findById(id);
        return res.send(userUpdated);
    } else return res.send({ error: true, type: 'Invalid password' });
};

ctrl.search = async (req, res) => {
    const { id, search, filterNav } = req.body;

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

    const dataToSearch = {
        _id: { $ne: id },
        description: { $ne: '' },
        validated: true,
        $or: [
            { firstName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { secondName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { lastName: { $regex: '.*' + search + '.*', $options: 'i' } },
            { secondSurname: { $regex: '.*' + search + '.*', $options: 'i' } },
            { username: { $regex: '.*' + search + '.*', $options: 'i' } },
            { email: search }
        ]
    };

    if (filterNav.city !== 'ciudad') dataToSearch.city = filterNav.city;
    if (filterNav.user !== 'usuario') dataToSearch.objetive = filterNav.user;

    const users = await User.find(dataToSearch, removeData);

    (users.length > 0)
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
                const url = `http://localhost:8080/user/${URLFile + extname}`;
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

module.exports = ctrl;