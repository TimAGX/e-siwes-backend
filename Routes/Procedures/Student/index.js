const express = require("express");
const randomString = require("randomstring");
const Receipt = require("../../../Models/Receipts");
const Student = require("../../../Models/Students");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

Router.post("/student/update/details", verifyJWT, async (req, res) => {
  const studentID = req.userID;
  const { bankAccount, yearOfStudy, courseOfStudy, attachmentPeriod, company } =
    req.body;

  Student.updateOne(
    { id: studentID },
    {
      $set: {
        bankAccount: {
          name: bankAccount.name,
          number: bankAccount.number,
          sortCode: bankAccount.sortCode,
        },
        yearOfStudy,
        courseOfStudy,
        attachmentPeriod,
        company: {
          name: company.name,
          address: company.address,
        },
      },
    }
  ).then(() => {
    res.json({
      auth: true,
      message: "Updated successfully!",
    });
  });
});

Router.get("/student/receipts", verifyJWT, async (req, res) => {
  const studentID = req.userID;

  const AllStudentReceipts = await Receipt.find({ studentID });
  res.json({
    auth: true,
    data: AllStudentReceipts,
  });
});
module.exports = Router;
