const express = require("express");
const app = express();

app.use(require("./Routes/Auth/Admin/index"));
app.use(require("./Routes/Auth/Student/index"));
app.use(require("./Routes/Auth/Supervisor/index"));
app.use(require("./Routes/Procedures/Admin/index"));
app.use(require("./Routes/Procedures/Student/index"));
app.use(require("./Routes/Procedures/Supervisor/index"));
require("./Modules/WebTokenAuth.js");

module.exports = app;
