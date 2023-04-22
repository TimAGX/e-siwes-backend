require("dotenv").config();
const PORT = process.env.PORT || 8080;
const DBURI = process.env.DBURI;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const Student = require("./Models/Students");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(require("./requirements"));

app.get("/", (req, res) => {
  res.json({
    server: true,
  });
});
mongoose.connect(DBURI).then((res) => {
  console.log("Connected: ", true);
  const student = new Student({
    id: "String",
    firstName: "String",
    lastName: "String",
    email: "String",
    password: "String",
    phone: "String",
    matricNumber: "String",
    yearOfStudy: "String",
    current: true,
    level: "400",
    courseOfStudy: "",
    supervisor: "",
    bankAccount: {
      name: "",
      number: "",
      sortCode: "",
      masterListNumber: "",
    },
    attachmentPeriod: "",
    company: {
      name: "",
      address: "",
    },
    isProfileComplete: true,
    hasPaid: true,
    notifications: [],
  });
  // student.save();
  app.listen(PORT, () => console.log(`Server started on ${PORT}`));
});
