const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const ResetSchema = new Schema({
  code: String,
  type: String,
  email: String,
  isValid: Boolean,
});

const Reset = model("reset", ResetSchema);
module.exports = Reset;
