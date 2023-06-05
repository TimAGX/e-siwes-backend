const express = require("express");
const randomString = require("randomstring");
const Key = require("../../../Models/Keys");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");
const nodemailer = require("nodemailer");
const Year = require("../../../Models/Years");
const { createTransport } = nodemailer;
const Router = express.Router();
const SendMail = async (email, header, body) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: "mcphersonsiwes@gmail.com",
      pass: "hyzidtubmxdamski",
    },
  });
  const mailOptions = {
    from: "mcphersonsiwes@gmail.com",
    to: email,
    subject: header,
    text: body,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

Router.post("/admin/year/obtain", verifyJWT, async (req, res) => {
  const { year } = req.body;
  if (!year) {
    res.json({
      auth: false,
      data: currentYear,
      message: "Provide a bleeding year!",
    });
  } else {
    const yearExists = await Year.findOne({ year });
    if (yearExists !== null) {
      const yearStudents = await Student.find({
        current: false,
        yearOfStudy: year,
      });
      res.json({
        auth: true,
        message: "Year found!",
        data: { year: yearExists, students: yearStudents },
      });
    } else {
      res.json({
        auth: false,
        message: "Year archive does not exist",
      });
    }
  }
});
Router.post("/admin/year/terminate", verifyJWT, async (req, res) => {
  const { year } = req.body;
  if (!year) {
    res.json({
      auth: false,
      message: "Provide a bleeding year!",
    });
  } else {
    const yearExists = await Year.findOne({ year });
    if (yearExists !== null) {
      res.json({
        auth: false,
        message: "Year already exists!",
      });
    } else {
      const newYear = new Year({
        id: year,
        year,
        current: true,
      });
      newYear.save().then(() => {
        Student.updateMany({ current: true }, { $set: { current: false, yearOfStudy: year } }).then(() => {
          res.json({
            auth: true,
            message: "Year successfully terminated",
          });
        });
      });
    }
  }
});
Router.get("/archives/get", verifyJWT, async (req, res) => {
  const pastYears = await Year.find();

  res.json({
    auth: true,
    data: pastYears,
  });
});
Router.post("/admin/student/token/generate", verifyJWT, async (req, res) => {
  const { matricNumber } = req.body;
  if (!matricNumber) {
    res.json({
      auth: false,
      message: "You must assign a MATRIC NUMBER to a token",
    });
  } else {
    const student = await Student.findOne({ matricNumber });
    if (student) {
      if (student.isAuthenticated) {
        res.json({
          auth: false,
          message: "Student is already authenticated",
        });
      } else {
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
          matricNumber,
        });
        token.save().then(() => {
          const sendStudentMail = SendMail(
            student.email,
            "Your Student E-SIWES Portal Token",
            `Your student token is:${studentToken}. This token is bound to your matric number: ${matricNumber} and cannot be used to activate another student account`
          ).then(() => {
            res.json({
              auth: true,
              data: studentToken,
            });
          });
          console.log(sendStudentMail);
          console.log("Token successfully saved!");
        });
      }
    } else {
      res.json({
        auth: false,
        message: "Student does not exist!",
      });
    }
  }
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
      data: supervisorKey,
      message: "Key generated and saved!",
    });
  });
});

Router.get("/admin/students", verifyJWT, async (req, res) => {
  const students = await Student.find({ current: true });

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
        Supervisor.updateMany({}, { $pull: { students: { studentID } } }).then(() => {
          Student.updateOne({ id: studentID }, { $set: { supervisor: supervisorID } }).then(() => {
            Supervisor.updateOne({ id: supervisorID }, { $push: { students: { studentID: studentID } } }).then(() => {
              res.json({
                auth: true,
                message: "Student assigned to supervisor",
                data: null,
              });
            });
          });
        });
      };
      if (!students) {
        // Supervisor has no students so add student
        AddStudent();
      } else {
        let isStudentInSupervisor = students.filter((s) => s.studentID === student.id);
        if (isStudentInSupervisor.length === 0) {
          // Student HAS NOT been assigned to supervisor so add student
          AddStudent();
        } else {
          // Student HAS ALREADY been assigned
          res.json({
            auth: false,
            message: "Student has already been assigned here!",
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
      Supervisor.updateOne({ id: supervisorID }, { $pull: { students: { studentID } } }).then(() => {
        Student.updateOne({ id: studentID }, { $set: { supervisor: "" } }).then(() => {
          res.json({
            auth: true,
            message: "Student successfully removed!",
          });
        });
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
    const students = await Student.find({});
    await students.map((student) => {
      const sendStudentMail = SendMail(student.email ?? "", title ?? "", body ?? "");
      return sendStudentMail;
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

Router.post("/supervisor/delete", verifyJWT, (req, res) => {
  const { supervisorID } = req.body;
  if (!supervisorID) {
    res.json({
      auth: false,
      message: "You must provide a Supervisor Unique ID",
    });
  } else {
    Supervisor.deleteOne({ id: supervisorID }).then(() => {
      res.json({
        auth: true,
        message: "Supervisor successfully deleted!",
      });
    });
  }
});

module.exports = Router;
