const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const {
  signAdminJWT,
  verifyJWT,
  signStudentJWT,
} = require("../../../Modules/WebTokenAuth");
const Token = require("../../../Models/Tokens");
const Student = require("../../../Models/Students");
const { CreateEncryptedPassword } = require("../../../Modules/AuthModule");

const Router = express.Router();

Router.post("/student/token/validate", async (req, res) => {
  const { token: studentToken } = req.body;
  const token = await Token.findOne({ token: studentToken });
  if (!studentToken) {
    res.json({
      auth: false,
      message: "Token is not present",
    });
  } else {
    if (token === null) {
      res.json({
        auth: false,
        message: "Token does not exist!",
      });
    } else {
      // Check if token is valid
      if (!token.valid) {
        res.json({
          auth: false,
          message: "Token is not valid",
        });
      } else {
        res.json({
          auth: true,
          token,
        });
      }
    }
  }
});

Router.post("/student/register", async (req, res) => {
  const { email, password, token, firstName, lastName } = req.body;
  if (!email || !password || !token || !firstName || !lastName) {
    res.json({
      auth: false,
      message: "Please fill all fields!",
    });
  } else {
    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent !== null) {
      // Student with email already exists
      res.json({
        auth: false,
        message: "Student already exists",
      });
    } else {
      // Create Password hash for student
      const encryptedPassword = await CreateEncryptedPassword(password);

      console.log("The password", encryptedPassword);
      // Create new student
      const studentID = randomString.generate({
        charset: "alphanumeric",
        length: 24,
      });
      const student = new Student({
        id: studentID,
        email,
        password: encryptedPassword,
        firstName,
        lastName,
        isProfileComplete: false,
      });

      student.save().then(() => {
        res.json({
          auth: true,
          message: "Student created successfully!",
        });
      });
    }
  }
});
Router.post("/student/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      auth: false,
      message: "Please enter email and password",
    });
  } else {
    const student = await Student.findOne({ email });
    if (student === null) {
      res.json({
        auth: false,
        message: "Student does not exist!",
      });
    } else {
      const { password: studentPassword, id: studentID } = student;
      const isPasswordValid = await bcrypt.compare(password, studentPassword);

      const token = signStudentJWT(studentID);
      res.json({
        auth: isPasswordValid,
        message: isPasswordValid ? "Login successful" : "Incorrect Password",
        token: isPasswordValid ? token : null,
      });
    }
  }
});

Router.get("/student/profile/:studentID", verifyJWT, async (req, res) => {
  const { studentID } = req.params;
  const student = await Student.findOne({ id: studentID });
  if (student === null) {
    res.json({
      auth: false,
      message: "Student does not exist",
    });
  } else {
    res.json({
      auth: true,
      student,
    });
  }
});
module.exports = Router;
