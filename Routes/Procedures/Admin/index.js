const express = require("express");
const randomString = require("randomstring");
const Key = require("../../../Models/Keys");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

Router.get("/admin/student/token/generate", verifyJWT, (req, res) => {
  const studentToken = randomString
    .generate({
      charset: "alphanumeric",
      length: 16,
    })
    .toUpperCase();

  const token = new Token({
    id: studentToken,
    token: studentToken,
    valid: true,
  });
  token.save().then(() => {
    console.log("Token successfully saved!");
    res.json({
      auth: true,
      data: studentToken,
    });
  });
});
Router.get("/admin/supervisor/key/generate", verifyJWT, (req, res) => {
  const supervisorKey = randomString
    .generate({
      charset: "alphanumeric",
      length: 16,
    })
    .toUpperCase();

  const key = new Key({
    id: supervisorKey,
    key: supervisorKey,
    valid: true,
  });
  key.save().then(() => {
    console.log("Supervisor key successfully saved!");
    res.json({
      auth: true,
      data: key,
    });
  });
});

Router.get("/admin/students", verifyJWT, (req, res) => {
  Student.find().then((students) => {
    console.log(students);
    res.json({
      data: students,
      auth: true,
    });
  });
});

Router.get("/admin/supervisors", verifyJWT, (req, res) => {
  Supervisor.find().then((supervisors) => {
    console.log(supervisors);
    res.json({
      data: supervisors,
      auth: true,
    });
  });
});

Router.post("/admin/supervisor/student/assign", verifyJWT, async (req, res) => {
  const { supervisorID, studentID } = req.body;

  if (!supervisorID || !studentID) {
    res.json({
      auth: false,
      message: "Fill out all fields!",
    });
  } else {
    const supervisor = await Supervisor.findOne({ id: supervisorID });
    const student = await Student.findOne({ id: studentID });

    const { students } = supervisor;

    const AddStudent = () => {
      Supervisor.updateOne(
        { id: supervisorID },
        { $push: { students: { studentID: studentID } } }
      ).then(() => {
        res.json({
          auth: true,
          message: "Student assigned to supervisor",
        });
      });
    };
    if (!students) {
      // Supervisor has no students so add student
      AddStudent();
    } else {
      let isStudentInSupervisor = students.filter(
        (s) => s.studentID === student.id
      );
      if (isStudentInSupervisor.length === 0) {
        // Student HAS NOT been assigned to supervisor so add student
        AddStudent();
      } else {
        // Student HAS ALREADY been assigned
        res.json({
          auth: false,
          message: "Student already Exists",
        });
      }
    }
  }
});

Router.post("/admin/supervisor/student/remove", verifyJWT, async (req, res) => {
  const { supervisorID, studentID } = req.body;

  if (!supervisorID || !studentID) {
    res.json({
      auth: false,
      message: "Fill out all fields!",
    });
  } else {
    Supervisor.updateOne(
      { id: supervisorID },
      { $pull: { students: { studentID } } }
    ).then(() => {
      res.json({
        auth: true,
        message: "Student successfully removed!",
      });
    });
  }
});
module.exports = Router;
