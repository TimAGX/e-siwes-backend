const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const supervisorSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  students: [
    {
      studentID: String,
    },
  ],

  isProfileComplete: Boolean,
});

const Supervisor = model("Supervisor", supervisorSchema);

module.exports = Supervisor;
