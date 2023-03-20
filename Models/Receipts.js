const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const receiptSchema = new Schema({
  id: String,
  studentID: String,
  date: Number,
  amount: Number,
  paid: Boolean,
});

const Receipt = model("Receipt", receiptSchema);

module.exports = Receipt;
