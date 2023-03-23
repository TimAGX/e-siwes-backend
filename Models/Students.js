const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const studentSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  matricNumber: String,
  supervisor: String,
  bankAccount: {
    name: String,
    number: String,
    sortCode: String,
    masterListNumber: String,
  },
  yearOfStudy: String,
  courseOfStudy: String,
  attachmentPeriod: String,
  company: {
    name: String,
    address: String,
  },
  isProfileComplete: Boolean,
  hasPaid: Boolean,
  notifications: [{ isOpen: Boolean, title: String, body: String, id: String }],
});

const Student = model("Student", studentSchema);

module.exports = Student;
