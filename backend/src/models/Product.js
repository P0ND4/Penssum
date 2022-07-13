const { Schema, model } = require('mongoose');

const ProductSchema = new Schema ({
    owner: { type: String, required: true },
    creatorUsername: { type: String, required: true },
    category: { type: String, required: true },
    city: { type: String, required: false, default: null },
    subCategory: { type: String, required: true },
    customCategory: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    modifiedDescription: { type: String },
    valueNumber: { type: Number, default: null },
    valueString: { type: String, default: null },
    dateOfDelivery: { type: Date, default: null },
    videoCall: { type: String, default: null },
    paymentMethod: { type: Boolean, default: false },
    stateActivated: { type: Boolean, default: false },

    advancePayment: { type: Boolean, default: false },
    paymentTOKEN: { type: String, default: null },
    paymentLink: { type: String, default: null },
    paymentType: { type: String, default: null },

    /*paymentDueDate: { type: Date, default: null },*/

    takenBy: { type: String, default: null },
    paymentRequest: { type: Object, default: {
        active: false,
        timeLimit: null
    }},

    files: { type: Array, required: true },
    miniature: { type: String, default: '' },
    linkMiniature: { type: String, default: '' },
    views: { type: Number, default: 0 },
    creationDate: { type: Date, default: Date.now },
    modificationDate: { type: Date, default: Date.now }
});

module.exports = model('product', ProductSchema);