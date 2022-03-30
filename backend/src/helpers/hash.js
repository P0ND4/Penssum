const bcrypt = require('bcryptjs');
const ctrl = {};

ctrl.scryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);
    return hash;
};

ctrl.matchPassword = async function (currentPassword,userPassword) {
    return await bcrypt.compare(currentPassword,userPassword);
};

module.exports = ctrl;