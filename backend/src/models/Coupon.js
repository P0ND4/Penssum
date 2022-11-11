const { Schema, model } = require('mongoose');

const CouponSchema = new Schema({
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
    utility: { type: Number, default: null },
    time: { type: Date, default: null },
    records: { type: Array, default: [] },
    creationDate: { type: Date, default: Date.now }
});

module.exports = model('coupon', CouponSchema);