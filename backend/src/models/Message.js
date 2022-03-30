const { Schema, model } = require('mongoose');

const MessageSchema = new Schema ({
    transmitter: { type: String, require: true },
    receiver: { type: String, require: true },
    message: { type: String, require: true },
    view: { type: Boolean, default: false },
    creationDate: { type: Date, default: Date.now() }
});

module.exports = model('message', MessageSchema);