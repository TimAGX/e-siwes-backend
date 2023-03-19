const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const studentSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  supervisor: String,
  bankAccount: {
    name: String,
    number: Number,
    sortCode: Number,
  },
});

const Student = model("Student", studentSchema);

module.exports = Student;
