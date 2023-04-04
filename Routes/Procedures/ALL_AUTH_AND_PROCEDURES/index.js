const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");
const Admin = require("../../../Models/Admins");
const { CreateEncryptedPassword } = require("../../../Modules/AuthModule");
const Reset = require("../../../Models/Resets");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
const nodemailer = require("nodemailer");
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
Router.post("/reset/generate", verifyJWT, async (req, res) => {
  const { type, email } = req.body;
  if (!type || !email) {
    res.json({
      auth: false,
      message: "User type and email must be specified",
    });
  } else {
    const UserNoExist = () => {
      res.status(401).json({
        auth: false,
        message: "User does not exist",
      });
    };
    const GenerateReset = () => {
      const randomCode = randomString.generate({
        charset: "alphabetic",
        length: 7,
      });
      const reset = new Reset({
        code: randomCode.toUpperCase(),
        type,
        email,
        isValid: true,
      });
      reset.save().then(() => {
        // Send Reset Code to email
        const mailHeader = `Password reset code for: ${email}`;
        const mailBody = `Your password reset code is: ${randomCode.toUpperCase()}`;
        SendMail(email, mailHeader, mailBody).then((emailResponse) => {
          console.log("Some email emailResponse: ", res);
          res.json({
            auth: true,
            message: `Reset code generated for ${type} at ${email}`,
          });
        });
      });
    };
    // Check if user exists in DB
    switch (type) {
      case "admin":
        const isAdmin = await Admin.findOne({ email });
        if (isAdmin === null) {
          UserNoExist();
        } else {
          GenerateReset();
        }
        break;
      case "student":
        const isStudent = await Student.findOne({ email });
        if (isStudent === null) {
          UserNoExist();
        } else {
          GenerateReset();
        }
        break;
      case "supervisor":
        const isSupervisor = await Supervisor.findOne({ email });
        if (isSupervisor === null) {
          UserNoExist();
        } else {
          GenerateReset();
        }
        break;
      default:
        res.json({
          auth: false,
          message: "Who the heck are you?!",
        });
        break;
    }
  }
});

Router.post("/reset/verify", verifyJWT, async (req, res) => {
  const { email, type, code } = req.body;
  if (!email || !type || !code) {
    res.json({
      auth: false,
      message: "Provide code, email and type",
    });
  } else {
    const resetObj = await Reset.findOne({
      type,
      email,
      code: code.toUpperCase(),
      isValid: true,
    });
    if (resetObj === null) {
      res.json({
        auth: false,
        message: "Code does not exist Majid!",
      });
    } else {
      Reset.deleteMany({ type, email }).then(() => {
        res.json({
          auth: true,
          message: "Code is valid",
        });
      });
    }
  }
});
module.exports = Router;
