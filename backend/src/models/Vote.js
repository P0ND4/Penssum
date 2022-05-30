const { Schema, model } = require('mongoose');

const VoteSchema = new Schema({
	from: { type: String, required: true },
	to: { type: String, required: true },
	productId: { type: String, required: true },
	vote: { type: Number, required: true },
	creationDate: { type: Date, default: Date.now() }
});

module.exports = model('vote', VoteSchema);