const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const yearSchema = new Schema({
  id: String,
  year: String,
  current: Boolean,
});

const Year = model("Year", yearSchema);

module.exports = Year;
