const express = require("express");
const randomString = require("randomstring");
const Comment = require("../../../Models/Comments");
const Receipt = require("../../../Models/Receipts");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
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

Router.post("/supervisor/comment", verifyJWT, async (req, res) => {
  const { studentID, comment } = req.body;

  if (!studentID || !comment) {
    res.json({
      auth: false,
      message: "Please provide a student and a comment to send",
    });
  } else {
    const t = randomString.generate({
      charset: "alphanumeric",
      length: 12,
    });
    const supervisorID = req.userID;
    const student = await Student.findOne({ id: studentID });
    const supervisor = await Supervisor.findOne({ id: supervisorID });
    const newComment = new Comment({
      id: t,
      supervisor: supervisorID,
      student: studentID,
      comment,
      studentName: `${student.firstName} ${student.lastName}`,
      supervisorName: `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`,
      sender: "supervisor",
    });
    newComment.save().then(() => {
      res.json({
        auth: true,
        message: "Comment successfully saved!",
      });
    });
  }
});
Router.post("/supervisor/comments/all", verifyJWT, async (req, res) => {
  const { studentID } = req.body;
  const supervisorID = req.userID;

  const c = await Comment.find({ supervisor: supervisorID, student: studentID });
  res.json({
    auth: c ? true : false,
    data: c,
  });
});
module.exports = Router;
