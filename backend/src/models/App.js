const { Schema, model } = require("mongoose");

const AppSchema = new Schema({ 
  id: { type: String, required: true },
  expo: { type: String, required: true },
  creationDate: { type: Date, default: Date.now }
});

module.exports = model("app", AppSchema);