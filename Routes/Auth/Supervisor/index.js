const express = require("express");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const {
  signAdminJWT,
  verifyJWT,
  signSupervisorJWT,
} = require("../../../Modules/WebTokenAuth");
const Admin = require("../../../Models/Admins");
const Key = require("../../../Models/Keys");
const Supervisor = require("../../../Models/Supervisors");
const { CreateEncryptedPassword } = require("../../../Modules/AuthModule");

const Router = express.Router();

Router.post("/supervisor/key/validate", async (req, res) => {
  const { key: supervisorKey } = req.body;
  if (!supervisorKey) {
    res.json({
      auth: false,
      message: "Key is not present",
    });
  } else {
    const key = await Key.findOne({ key: supervisorKey });
    if (key === null) {
      res.json({
        auth: false,
        message: "Key does not exist!",
      });
    } else {
      // Check if key is valid
      if (!key.valid) {
        res.json({
          auth: false,
          message: "Key is not valid",
        });
      } else {
        res.json({
          auth: true,
          data: key,
        });
      }
    }
  }
});

Router.post("/supervisor/register", async (req, res) => {
  const { email, password, key, firstName, lastName, title, phone } = req.body;
  if (
    !email ||
    !title ||
    !firstName ||
    !lastName ||
    !key ||
    !password ||
    !phone
  ) {
    res.json({
      auth: false,
      message: "Please fill all fields!",
    });
  } else {
    // Check if supervisor key is valid
    const findKey = await Key.findOne({ key });
    if (findKey !== null) {
      if (findKey.valid) {
        // Check if email already exists
        const existingSupervisor = await Supervisor.findOne({ email });
        if (existingSupervisor !== null) {
          // Supervisor with email already exists
          res.json({
            auth: false,
            message: "Supervisor already exists",
          });
        } else {
          // Create Password hash for supervisoru
          const encryptedPassword = await CreateEncryptedPassword(password);

          // Create new supervisoru
          const supervisorID = randomString.generate({
            charset: "alphanumeric",
            length: 24,
          });
          const supervisor = new Supervisor({
            id: supervisorID,
            firstName,
            lastName,
            email,
            title,
            phone,
            password: encryptedPassword,
            isProfileComplete: false,
          });

          supervisor.save().then(() => {
            Key.updateOne({ key }, { $set: { valid: false } }).then(() => {
              res.json({
                auth: true,
                message: "Supervisor created successfully!",
              });
            });
          });
        }
      } else {
        res.json({
          auth: false,
          message: "Supervisor key is not valid",
        });
      }
    } else {
      res.json({
        auth: false,
        message: "Supervisor key is not valid",
      });
    }
  }
});
Router.post("/supervisor/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      auth: false,
      message: "Please enter email and password",
    });
  } else {
    const supervisor = await Supervisor.findOne({ email });
    if (supervisor === null) {
      res.json({
        auth: false,
        message: "Supervisor does not exist!",
      });
    } else {
      const { password: supervisorPassword, id: supervisorID } = supervisor;
      const isPasswordValid = await bcrypt.compare(
        password,
        supervisorPassword
      );

      const token = signSupervisorJWT(supervisorID);
      res.json({
        auth: isPasswordValid,
        message: isPasswordValid ? "Login successful" : "Incorrect Password",
        data: isPasswordValid ? token : null,
      });
    }
  }
});

Router.get("/supervisor/profile/:supervisorID", verifyJWT, async (req, res) => {
  const { supervisorID } = req.params;
  if (supervisorID === "currentIsSupervisor") {
    const currentSupervisorID = req.userID;
    const supervisor = await Supervisor.findOne({ id: currentSupervisorID });
    res.json({
      auth: supervisor !== null,
      data: supervisor,
      message:
        supervisor !== null
          ? "Supervisor found"
          : "No Supervisor found matching ID",
    });
  } else {
    const supervisor = await Supervisor.findOne({ id: supervisorID });
    if (supervisor === null) {
      res.json({
        auth: false,
        message: "Supervisor does not exist",
      });
    } else {
      res.json({
        auth: true,
        data: supervisor,
      });
    }
  }
});

module.exports = Router;
