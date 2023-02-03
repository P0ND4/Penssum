const { Schema, model } = require('mongoose');

const MessageSchema = new Schema ({
    key: { type: String, require: true },
    users: { type: Array, require: true },
    messages: { type: Array, require: true },
    creationDate: { type: Date, default: Date.now },
    modificationDate: { type: Date, default: Date.now },
});

module.exports = model('message', MessageSchema);