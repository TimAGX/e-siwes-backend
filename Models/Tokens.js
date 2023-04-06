const mongoose = require("mongoose");

const { Schema } = mongoose;

const tokenSchema = new Schema({
  id: String,
  token: String,
  valid: Boolean,
  matricNumber: String,
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
