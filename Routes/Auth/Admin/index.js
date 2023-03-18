// Admin initial email is atajiboyeo@gmail.com
// Admin initial password is password2023

const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

const adminLoginData = {
  email: "atajiboyeo@gmail.com",
  password: "password2023",
  validHash: "$2b$10$Ufuvd3j6kynO0DiqLNmcjePn5huc9dA.ltwUE2mT2upoOj0TReZpm",
};

Router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === adminLoginData.email) {
    const isPasswordValid = await bcrypt.compare(
      password,
      adminLoginData.validHash
    );

    const token = signAdminJWT(adminLoginData.email);
    res.json({
      auth: isPasswordValid,
      message: isPasswordValid ? "Correct Auth Details" : "Invalid Password",
      token: isPasswordValid ? token : undefined,
    });
  } else {
    res.json({
      auth: false,
      message: "Invalid Email Address",
    });
  }
});

module.exports = Router;
