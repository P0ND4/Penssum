const { Schema, model } = require('mongoose');

const OfferSchema = new Schema ({
    product: { type: String, required: true },
    user: { type: String, required: true },
    value: { type: Number, required: true },
    username: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    counterOffer: { type: Boolean, default: false },
    acceptOffer: { type: Boolean, default: false },
    isThePayment: { type: Boolean, default: false },
    isBought: { type: Boolean, default: false },
    creationDate: { type: Date, default: Date.now }
});

module.exports = model('offer', OfferSchema);