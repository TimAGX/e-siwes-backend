const express = require("express");
const randomString = require("randomstring");
const Comment = require("../../../Models/Comments");
const Receipt = require("../../../Models/Receipts");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
const Token = require("../../../Models/Tokens");
const { COLNAS_COURSES, COSMAS_COURSES, COLMED_COURSES } = require("../../../Modules/CoursesModule");
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
      id: randomString.generate({ charset: "alphanumeric", length: 12 }).concat(Date.now().toString()).toUpperCase(),
      studentID,
      date: Date.now(),
      amount: 2000,
      paid: true,
    });

    receipt.save().then(() => {
      Student.updateOne({ id: studentID }, { $set: { hasPaid: true } }).then(() => {
        res.json({
          auth: true,
          message: "Payment Successful",
        });
      });
    });
  }
});

Router.post("/student/courses/get", verifyJWT, async (req, res) => {
  let { college } = req.body;

  if (!college) {
    res.json({
      auth: false,
      message: "Please provide a college",
    });
  } else {
    college = college.toUpperCase();
    const getCourses = () => {
      return college === "COLNAS" ? COLNAS_COURSES : college === "COSMAS" ? COSMAS_COURSES : COLMED_COURSES;
    };

    res.json({
      auth: true,
      data: getCourses(),
    });
  }
});
Router.get("/student/supervisor/get", verifyJWT, async (req, res) => {
  const studentID = req.userID;

  const student = await Student.findOne({ id: studentID });
  const supervisor = await Supervisor.findOne({ id: student ? student.supervisor : "" });

  res.json({
    auth: supervisor ? true : false,
    data: supervisor,
  });
});

Router.post("/student/comment", verifyJWT, async (req, res) => {
  const { supervisorID, comment } = req.body;

  if (!supervisorID || !comment) {
    res.json({
      auth: false,
      message: "Please provide a supervisor and a comment to send",
    });
  } else {
    const studentID = req.userID;
    const t = randomString.generate({
      charset: "alphanumeric",
      length: 12,
    });
    const student = await Student.findOne({ id: studentID });
    const supervisor = await Supervisor.findOne({ id: supervisorID });
    const newComment = new Comment({
      id: t,
      supervisor: supervisorID,
      student: studentID,
      comment,
      studentName: `${student.firstName} ${student.lastName}`,
      supervisorName: `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`,
      sender: "student",
    });
    newComment.save().then(() => {
      res.json({
        auth: true,
        message: "Comment successfully saved!",
      });
    });
  }
});
Router.post("/student/comments/all", verifyJWT, async (req, res) => {
  const { supervisorID } = req.body;
  const studentID = req.userID;

  const c = await Comment.find({ supervisor: supervisorID, student: studentID });
  res.json({
    auth: c ? true : false,
    data: c,
  });
});
module.exports = Router;
