const express = require("express");
const randomString = require("randomstring");
const Receipt = require("../../../Models/Receipts");
const Student = require("../../../Models/Students");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

Router.post("/supervisor/students", async (req, res) => {
  const { supervisorID } = req.body;

  if (!supervisorID || (supervisorID && supervisorID.length === 0)) {
    res.json({
      auth: false,
      message: "Supervisor must have an ID",
    });
  } else {
    const students = await Student.find({ supervisor: supervisorID });

    res.json({
      auth: true,
      message: students === null ? "No students found" : "Students Found",
      data: students,
    });
  }
});
Router.get("/supervisor/students/get", verifyJWT, async (req, res) => {
  const supervisorID = req.userID;
  console.log("Supervisor ID", supervisorID);
  const students = await Student.find({
    supervisor: supervisorID,
    current: true,
  });

  res.json({
    auth: true,
    message: students === null ? "No students found" : "Students Found",
    data: students,
  });
});
module.exports = Router;
