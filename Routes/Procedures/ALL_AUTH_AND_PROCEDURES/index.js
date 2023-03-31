const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");
const Admin = require("../../../Models/Admins");
const { CreateEncryptedPassword } = require("../../../Modules/AuthModule");
const Reset = require("../../../Models/Resets");
const Student = require("../../../Models/Students");
const Supervisor = require("../../../Models/Supervisors");
const Router = express.Router();

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
        length: 6,
      });
      const reset = new Reset({
        code: randomCode.toUpperCase(),
        type,
        email,
        isValid: true,
      });
      reset.save().then(() => {
        res.json({
          auth: true,
          message: `Reset code generated for ${type} at ${email}`,
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

module.exports = Router;
