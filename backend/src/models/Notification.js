const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema ({
    username: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    from: { type: String, required: true },
    to: { type: String, required: true },
    productId: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String },
    image: { type: String, default: null },
    view: { type: Boolean, default: false },
    files: { type: Array, default: [] },
    creationDate: { type: Date, default: Date.now }
});

module.exports = model('notification', NotificationSchema);