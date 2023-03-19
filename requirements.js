const express = require("express");
const app = express();

app.use(require("./Routes/Auth/Admin/index"));
app.use(require("./Routes/Auth/Student/index"));
app.use(require("./Routes/Procedures/Admin/index"));
require("./Modules/WebTokenAuth.js");

module.exports = app;
