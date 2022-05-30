const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
	userId: { type: String, required: true },
	ownerId: { type: String, required: true },
	productId: { type: String, required: true },
	amount: { type: Number, required: true },
	orderId: { type: Number, default: 0 },
	transactionId: { type: String, required: true },
	operationDate: { type: Number, required: true },
	paymentType: { type: String, required: true },
	paymentNetwork: { type: String, required: true }
});

module.exports = model('transaction', TransactionSchema);