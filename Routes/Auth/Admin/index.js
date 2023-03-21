// Admin initial email is atajiboyeo@gmail.com
// Admin initial password is password2023

const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");
const Admin = require("../../../Models/Admins");

const Router = express.Router();

const defaultAdminLoginData = {
  email: "atajiboyeo@gmail.com",
  password: "password2023",
  validHash: "$2b$10$Ufuvd3j6kynO0DiqLNmcjePn5huc9dA.ltwUE2mT2upoOj0TReZpm",
};

Router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      auth: false,
      message: "Please provide email and password!",
    });
  } else {
    const AdminData = await Admin.findOne();
    if (email === AdminData.email) {
      const isPasswordValid = await bcrypt.compare(
        password,
        AdminData.password
      );

      const token = signAdminJWT(AdminData.email);
      res.json({
        auth: isPasswordValid,
        message: isPasswordValid ? "Correct Auth Details" : "Invalid Password",
        data: isPasswordValid ? token : undefined,
      });
    } else {
      res.json({
        auth: false,
        message: "Invalid Email Address",
      });
    }
  }
});

Router.get("/admin/profile", verifyJWT, (req, res) => {
  Admin.find({}).then((admin) => {
    res.json({
      admin,
    });
  });
});

Router.post("/admin/profile/email", verifyJWT, (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) {
    res.json({
      auth: false,
    });
  } else {
    Admin.updateMany({}, { $set: { email: newEmail } }).then(() => {
      res.json({
        auth: true,
      });
    });
  }
});
Router.post("/admin/password/validate", verifyJWT, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.json({
      auth: false,
      message: "Password is not present",
    });
  } else {
    const admin = await Admin.findOne();
    const { password: CurrentPassword } = admin;
    const isPasswordValid = await bcrypt.compare(password, CurrentPassword);
    res.json({
      auth: isPasswordValid,
    });
  }
});
module.exports = Router;
