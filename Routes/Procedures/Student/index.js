const express = require("express");
const randomString = require("randomstring");
const Receipt = require("../../../Models/Receipts");
const Student = require("../../../Models/Students");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

Router.post("/student/check/matric", verifyJWT, async (req, res) => {
  const { matricNumber } = req.body;
  if (!matricNumber) {
    res.json({
      auth: false,
      message: "Please provide a matric number",
    });
  } else {
    // If Data is null, then no student exists with Matric Number
    const student = await Student.findOne({ matricNumber });
    res.json({
      auth: true,
      data: student,
    });
  }
});

Router.get("/student/receipts", verifyJWT, async (req, res) => {
  const studentID = req.userID;

  const AllStudentReceipts = await Receipt.find({ studentID });
  res.json({
    auth: true,
    data: AllStudentReceipts,
  });
});

Router.post("/student/payment/confirm", verifyJWT, async (req, res) => {
  const { studentID } = req.body;

  if (!studentID) {
    res.json({
      auth: false,
      message: "Please provide a student ID",
    });
  } else {
    // Create Student Receipt
    const receipt = new Receipt({
      id: randomString
        .generate({ charset: "alphanumeric", length: 12 })
        .concat(Date.now().toString())
        .toUpperCase(),
      studentID,
      date: Date.now(),
      amount: 2000,
      paid: true,
    });

    receipt.save().then(() => {
      Student.updateOne({ id: studentID }, { $set: { hasPaid: true } }).then(
        () => {
          res.json({
            auth: true,
            message: "Payment Successful",
          });
        }
      );
    });
  }
});
module.exports = Router;
