const { Schema, model } = require('mongoose');

const DashboardSchema = new Schema ({
    usersWarning: { type: Array, default: [] },
    locked: { type: Array, default: [] },
    firstEmail: { type: String, default: 'penssum@admin.org' },
    firstPassword: { type: String, default: 'penssum' },
    secondEmail: { type: String, default: 'penssum@admin.org' },
    secondPassword: { type: String, default: 'penssum' },
    keyword: { type: String, default: 'dashboard' },
    name: { type: String, default: 'Jack' },
    productReview: { type: Boolean, default: true },
    allowVideoCall: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
});

module.exports = model('administration', DashboardSchema);