const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  id: String,
  email: String,
  password: String,
});

const Admin = model("Admin", adminSchema);

module.exports = Admin;
