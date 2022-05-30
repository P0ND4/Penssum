const { Schema, model } = require('mongoose');

const ProductSchema = new Schema ({
    owner: { type: String, required: true },
    creatorUsername: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    customCategory: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    value: { type: Number, default: null },
    dateOfDelivery: { type: Date, default: null },
    videoCall: { type: String, default: null },
    paymentMethod: { type: Boolean, default: false },
    stateActivated: { type: Boolean, default: false },
    files: { type: Array, required: true },
    miniature: { type: String, default: '' },
    linkMiniature: { type: String, default: '' },
    views: { type: Number, default: 0 },
    creationDate: { type: Date, default: Date.now() },
    modificationDate: { type: Date, default: Date.now() }
});

module.exports = model('product', ProductSchema);