const mongoose = require("mongoose");

const { Schema } = mongoose;

const keySchema = new Schema({
  id: String,
  key: String,
  valid: Boolean,
});

const Key = mongoose.model("Key", keySchema);
module.exports = Key;
