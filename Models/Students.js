const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const studentSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  supervisor: String,
  bankAccount: {
    name: String,
    number: Number,
    sortCode: Number,
  },
  isProfileComplete: Boolean,
});

const Student = model("Student", studentSchema);

module.exports = Student;
