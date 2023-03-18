const express = require("express");
const randomString = require("randomstring");
const Token = require("../../../Models/Tokens");
const { signAdminJWT, verifyJWT } = require("../../../Modules/WebTokenAuth");

const Router = express.Router();

Router.get("/admin/generateStudentToken", verifyJWT, (req, res) => {
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
      id: req.userID,
      somes: "Stuff",
      token: studentToken,
    });
  });
});

module.exports = Router;
