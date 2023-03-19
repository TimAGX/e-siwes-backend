require("dotenv").config();
const jwtSecret = process.env.SECRET;
const bcrypt = require("bcrypt");

const CreateEncryptedPassword = async (passwordString) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(passwordString, salt);
  return hash;
};

module.exports = {
  CreateEncryptedPassword,
};
