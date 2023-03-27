// Admin initial email is atajiboyeo@gmail.com
// Admin initial password is password2023

const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");
const Admin = require("../../../Models/Admins");
const { CreateEncryptedPassword } = require("../../../Modules/AuthModule");

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
    const AdminData = await Admin.findOne({ email });
    console.log("The Admin Data: ", AdminData);
    console.log("The email: ", email);
    if (AdminData !== null) {
      const isPasswordValid = await bcrypt.compare(
        password,
        AdminData.password
      );

      const token = signAdminJWT(AdminData.id);
      res.json({
        auth: isPasswordValid,
        message: isPasswordValid ? "Correct Auth Details" : "Invalid Password",
        data: isPasswordValid ? token : undefined,
      });
    } else {
      res.json({
        auth: false,
        message: "No admin found!",
      });
    }
  }
});

Router.get("/admin/profile", verifyJWT, (req, res) => {
  Admin.findOne({}).then((admin) => {
    res.json({
      auth: !(admin === null),
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

Router.post("/admin/password/update", verifyJWT, async (req, res) => {
  const adminID = req.userID;
  console.log(adminID);
  const admin = await Admin.findOne({ id: adminID });
  if (admin === null) {
    res.json({
      auth: false,
      message: "Priviledge not granted to user",
    });
  } else {
    const { password: newPassword } = req.body;
    if (!newPassword) {
      res.json({
        auth: false,
        message: "Password cannot be blank",
      });
    } else {
      const encryptedPassword = await CreateEncryptedPassword(newPassword);
      Admin.updateOne(
        { id: adminID },
        { $set: { password: encryptedPassword } }
      ).then(() => {
        res.json({
          auth: true,
          message: "Password successfully updated!",
        });
      });
    }
  }
});

Router.get("/admin/token/validate", verifyJWT, async (req, res) => {
  const adminID = req.userID;
  const admin = Admin.findOne({ id: adminID });
  if (admin === null) {
    res.json({
      auth: false,
      message: "Admin is not authorized",
    });
  } else {
    res.json({
      auth: true,
      message: "Admin authentication successful!",
    });
  }
});
module.exports = Router;
