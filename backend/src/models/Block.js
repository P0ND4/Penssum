const { Schema, model } = require('mongoose');

const BlockSchema = new Schema ({
    from: { type: String, require: true },
    to: { type: String, require: true },
    creationDate: { type: Date, default: Date.now }
});

module.exports = model('block', BlockSchema);