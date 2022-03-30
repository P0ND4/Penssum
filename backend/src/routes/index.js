const express = require('express');
const router = express.Router;

const multer = require('multer');
const path = require('path');

const uploadTemporal = multer({ dest: path.join(__dirname, '../public/temporal') });
const uploadServices = multer({ dest: path.join(__dirname, '../public/services') });
const uploadProfile = multer({ dest: path.join(__dirname, '../public/user') });

const user = require('../controllers/user');
const product = require('../controllers/product');
const admin = require('../controllers/administration');
const event = require('../controllers/event');

module.exports = app => {
    // event
    app.post('/notifications', event.getNotifications);
    app.post('/mark/notification', event.revisedNotification);
    app.post('/unchecked/messages', event.getUncheckedMessages);
    app.post('/mark/unchecked/messages', event.revisedMessages);
    app.post('/block/user', event.block);
    app.post('/review/blocked', event.reviewBlocked);
    app.post('/remove/block', event.removeBlock);
    app.post('/send/report', event.report);

    // users routes
    app.post('/users', user.users);
    app.post('/user/get', user.get);
    app.post('/user/signin', user.signin);
    app.post('/user/signup', user.signup);
    app.post('/user/signup/authentication', user.accountAuthentication);
    app.post('/user/change/mail', user.changeMail);
    app.post('/user/signup/token/verification', user.tokenVerification);
    app.post('/user/delete', user.delete);
    app.post('/user/change/preference/value', user.changePreferenceValue);
    app.post('/user/change/password', user.changePassword);
    app.post('/search/users', user.search);
    app.post('/search/all/users', user.findAllUsers);
    app.post('/user/change/photo', uploadProfile.single('image'), user.changePhoto);

    // routes product
    app.post('/products', product.products);
    app.post('/product/file/selection', uploadTemporal.array('files'), product.fileSelection);
    app.post('/product/remove/files', product.removeFiles);
    app.post('/product/create', uploadServices.array('files'), product.create);
    app.post('/product/increase/view', product.increaseView);
    app.post('/product/make/offer', product.makeOffer);
    app.post('/product/make/counteroffer', product.makeCounteroffer);
    app.post('/product/accept/offer', product.acceptOffer);
    app.post('/product/remove/offer', product.removeOffer);
    app.post('/product/offer', product.getOffer);
    app.post('/product/accept', product.accept);
    app.post('/product/remove', product.delete);
    app.post('/product/send/quote', product.sendQuote);
    app.post('/filter/product', product.filter);

    //admin
    app.post('/admin/information', admin.main);
    app.post('/dashboard/information', admin.dashboard);
    app.post('/administration/change/preference/value', admin.changePreferenceValue);
    app.post('/check/admin/information', admin.checkAdminInformation);
    app.post('/administration/change/password', admin.changePassword)

    app.use(router);
};