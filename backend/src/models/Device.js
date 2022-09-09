const { Schema, model } = require("mongoose");

const DeviceSchema = new Schema({ device: { type: String, required: true } });

module.exports = model("device", DeviceSchema);