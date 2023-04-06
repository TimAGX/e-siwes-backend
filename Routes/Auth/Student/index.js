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
  if (!studentToken) {
    res.json({
      auth: false,
      message: "Token is not present",
    });
  } else {
    const token = await Token.findOne({ token: studentToken });
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
          data: token,
        });
      }
    }
  }
});

Router.post("/student/register", async (req, res) => {
  const { email, password, token, firstName, lastName, matricNumber } =
    req.body;
  if (
    !email ||
    !password ||
    !token ||
    !firstName ||
    !lastName ||
    !matricNumber
  ) {
    res.json({
      auth: false,
      message: "Please fill all fields!",
    });
  } else {
    // Check if email already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { matricNumber }],
    });
    if (existingStudent !== null) {
      // Student with matric or email already exists
      res.json({
        auth: false,
        message: "Student already exists",
      });
    } else {
      // Create Password hash for student
      const encryptedPassword = await CreateEncryptedPassword(password);

      // Create new student
      const studentID = randomString.generate({
        charset: "alphanumeric",
        length: 24,
      });
      const tokenInDB = await Token.findOne({ token });
      // Check if token is in DB
      if (tokenInDB === null) {
        res.json({
          auth: false,
          message: "Student Token is not valid",
        });
      } else {
        // Check if token is valid
        if (tokenInDB.valid) {
          const student = new Student({
            id: studentID,
            firstName,
            lastName,
            email,
            password: encryptedPassword,
            phone: "",
            matricNumber,
            supervisor: "",
            bankAccount: {
              number: "",
              sortCode: "",
              masterListNumber: "",
              name: "",
            },
            yearOfStudy: "",
            courseOfStudy: "",
            attachmentPeriod: "",
            company: {
              name: "",
              address: "",
            },
            isProfileComplete: false,
            hasPaid: false,
            notifications: [],
          });

          student.save().then(() => {
            Token.updateOne({ token }, { $set: { valid: false } }).then(() => {
              const JWT_Token = signStudentJWT(studentID);
              res.json({
                auth: true,
                message: "Student created successfully!",
                data: JWT_Token,
              });
            });
          });
        } else {
          // Token is in DB but is not valid
          res.json({
            auth: false,
            message: "Token is expired",
          });
        }
      }
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
    const student = await Student.findOne({
      $or: [{ email }, { matricNumber: email }],
    });
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
        data: isPasswordValid ? token : null,
      });
    }
  }
});

Router.get("/student/profile/:studentID", verifyJWT, async (req, res) => {
  const { studentID } = req.params;
  if (studentID === "currentIsStudent") {
    // Recipient is not an Admin innit
    const ID = req.userID;
    const student = await Student.findOne({ id: ID });
    if (student === null) {
      res.json({
        auth: false,
        message: "Student does not exist",
      });
    } else {
      res.json({
        auth: true,
        data: student,
      });
    }
  } else {
    const student = await Student.findOne({ id: studentID });
    if (student === null) {
      res.json({
        auth: false,
        message: "Student does not exist",
      });
    } else {
      res.json({
        auth: true,
        data: student,
      });
    }
  }
});

Router.post("/student/basic/profile/update", verifyJWT, async (req, res) => {
  const studentID = req.userID;
  const {
    email,
    firstName,
    lastName,
    phone,
    courseOfStudy,
    yearOfStudy,
    level,
  } = req.body;
  if (
    !email ||
    !firstName ||
    !lastName ||
    !phone ||
    !courseOfStudy ||
    !yearOfStudy ||
    !level
  ) {
    res.json({
      auth: false,
      message: "Pleazzze fill out all fields",
    });
  } else {
    Student.updateOne(
      { id: studentID },
      {
        $set: {
          email,
          firstName,
          lastName,
          phone,
          yearOfStudy,
          level,
          courseOfStudy,
        },
      }
    ).then(() => {
      res.json({
        auth: true,
      });
    });
  }
});
Router.post("/student/advanced/profile/update", verifyJWT, async (req, res) => {
  const studentID = req.userID;
  const {
    bankAccountName,
    bankAccountNumber,
    sortCode,
    masterListNumber,
    attachmentPeriod,
    companyName,
    companyAddress,
  } = req.body;
  if (
    !bankAccountName ||
    !bankAccountNumber ||
    !sortCode ||
    !masterListNumber ||
    !attachmentPeriod ||
    !companyName ||
    !companyAddres
  ) {
    res.json({
      auth: false,
      message: "Pleae fill out all fields",
    });
  } else {
    Student.updateOne(
      { id: studentID },
      {
        $set: {
          bankAccount: {
            name: bankAccountName,
            number: bankAccountNumber,
            sortCode,
            masterListNumber,
          },
          attachmentPeriod,
          company: {
            name: companyName,
            address: companyAddress,
          },
        },
      }
    ).then(() => {
      res.json({
        auth: true,
      });
    });
  }
});

Router.post("/student/password/validate", verifyJWT, async (req, res) => {
  const studentID = req.userID;
  const { password } = req.body;

  if (!password) {
    res.json({
      auth: false,
      message: "Password is not present",
    });
  } else {
    const student = await Student.findOne({ id: studentID });
    const { password: studentPassword } = student;

    const isPasswordValid = await bcrypt.compare(password, studentPassword);

    res.json({
      auth: isPasswordValid,
      message: isPasswordValid ? "Password is correct!" : "Incorrect password",
    });
  }
});

Router.post("/student/password/update", verifyJWT, async (req, res) => {
  const { password: newPassword } = req.body;
  if (!newPassword) {
    res.json({
      auth: false,
      message: "Password is not present",
    });
  } else {
    const studentID = req.userID;
    const password = await CreateEncryptedPassword(newPassword);
    Student.updateOne({ id: studentID }, { $set: { password } })
      .then(() => {
        res.json({
          auth: true,
        });
      })
      .catch(() => {
        res.json({
          auth: false,
          message: "An error occured",
        });
      });
  }
});
module.exports = Router;
