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

Router.get("/admin/students", verifyJWT, async (req, res) => {
  const students = await Student.find();

  res.json({
    data: students ? students : [],
    auth: true,
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

    if (supervisor === null || student === null) {
      res.json({
        auth: false,
        message: "Either student or supervisor is invalid",
      });
    } else {
      const { students } = supervisor;

      const AddStudent = () => {
        Student.updateOne(
          { id: studentID },
          { $set: { supervisor: supervisorID } }
        ).then(() => {
          Supervisor.updateOne(
            { id: supervisorID },
            { $push: { students: { studentID: studentID } } }
          ).then(() => {
            res.json({
              auth: true,
              message: "Student assigned to supervisor",
              data: null,
            });
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
    const supervisor = await Supervisor.findOne({ id: supervisorID });
    const student = await Student.findOne({ id: studentID });
    if (supervisor === null || student === null) {
      res.json({
        auth: false,
        message: "Student or Supervisor is invalid",
      });
    } else {
      Supervisor.updateOne(
        { id: supervisorID },
        { $pull: { students: { studentID } } }
      ).then(() => {
        Student.updateOne({ id: studentID }, { $set: { supervisor: "" } }).then(
          () => {
            res.json({
              auth: true,
              message: "Student successfully removed!",
            });
          }
        );
      });
    }
  }
});

Router.post("/admin/student/notification/send", verifyJWT, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.json({
      auth: false,
      message: "Please provide both title and body!",
    });
  } else {
    const notificationID = randomString.generate({
      charset: "alphanumeric",
      length: 20,
    });
    Student.updateMany(
      {},
      {
        $push: {
          notifications: {
            isOpen: true,
            title,
            body,
            id: notificationID.toUpperCase(),
          },
        },
      }
    ).then(() => {
      res.json({
        auth: true,
        message: "Notification sent to student!",
      });
    });
  }
});

module.exports = Router;
