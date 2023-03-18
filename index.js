require("dotenv").config();
const PORT = process.env.PORT || 8080;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

app.use(require("./Routes/Auth/Admin/index.js"));
require("./Modules/WebTokenAuth.js");

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
