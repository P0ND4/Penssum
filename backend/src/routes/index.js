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

const root = path.join(__dirname, '../public', 'build');

module.exports = app => {
    // event

    app.use(express.static(root));
    app.get("*", (req, res) => res.sendFile('index.html', { root }));

    app.post('/notifications', event.getNotifications);
    app.post('/mark/notification', event.revisedNotification);
    app.post('/unchecked/messages', event.getUncheckedMessages);
    app.post('/mark/unchecked/messages', event.revisedMessages);
    app.post('/block/user', event.block);
    app.post('/review/blocked', event.reviewBlocked);
    app.post('/remove/block', event.removeBlock);
    app.post('/send/report', event.report);
    app.post('/send/information/admin', event.sendInformationAdmin);
    app.post('/suspension/control', event.suspensionControl);
    app.post('/get/transaction', event.transactions)
    app.post('/remove/transaction', event.removeTransaction);
    app.post('/vote', event.vote);
    app.post('/get/vote', event.getVote);
    app.post('/rejection/vote', event.rejectVote);
    app.post('/send/transaction/verification', event.sendTransactionVerification);
    app.post('/get/coupons', event.getCoupons);
    app.post('/remove/coupon', event.removeCoupon);
    app.post('/coupon/control', event.couponControl);

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
    app.post('/user/complete/information', user.completeInformation);
    app.post('/user/change/password', user.changePassword);
    app.post('/search/users', user.search);
    app.post('/search/all/users', user.findAllUsers);
    app.post('/user/change/photo', uploadProfile.single('image'), user.changePhoto);
    app.post('/user/recovery/password', user.recoveryPassword);

    // routes product
    app.post('/products', product.products);
    app.post('/search/products', product.search);
    app.post('/product/file/selection', uploadTemporal.array('productFiles'), product.fileSelection);
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
    app.post('/product/take', product.take);
    app.post('/product/remove/take', product.removeTake);
    app.post('/filter/product', product.filter);
    app.post('/change/video_call/URL', product.changeVideoCallURL);
    app.post('/pay/product', product.payProduct);
    app.post('/get/banks/available', product.banksAvailable);
    app.post('/save/transaction', product.saveTransaction);
    app.post('/get/task', product.getTask);
    app.post('/product/request/payment', product.requestPayment);
    app.post('/product/teacher/payment', product.teacherPayment);
    app.post('/remove/payment', product.removePayment);

    //admin
    app.post('/admin/information', admin.main);
    app.post('/dashboard/information', admin.dashboard);
    app.post('/administration/change/preference/value', admin.changePreferenceValue);
    app.post('/check/admin/information', admin.checkAdminInformation);
    app.post('/administration/change/password', admin.changePassword);
    app.post('/send/warning', admin.sendWarning);
    app.post('/user/status/change', admin.userStatusChange);
    app.post('/create/coupon', admin.createCoupon);

    app.use(router);
};