const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
	userId: { type: String, required: true },
	advance: { type: Boolean, default: false },
	method: { type: String },
	productTitle: { type: String },
	ownerId: { type: String },
	description: { type: String },
	productId: { type: String },
	amount: { type: Number, required: true },
	orderId: { type: Number, default: 0 },
	transactionId: { type: String },
	operationDate: { type: Number, default: Date.now },
	paymentType: { type: String },
	paymentNetwork: { type: String },
	verification: { type: Boolean, default: false },
	files: { type: Array, default: [] },
	creationDate: { type: Date, default: Date.now }
});

module.exports = model('transaction', TransactionSchema);