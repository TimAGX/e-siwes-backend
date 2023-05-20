require("dotenv").config();
const jwtSecret = process.env.SECRET;
const bcrypt = require("bcrypt");

const CreateEncryptedPassword = async (passwordString) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(passwordString, salt);
  return hash;
};
const Banks = [
  { id: "1", name: "Access Bank", code: "044" },
  { id: "2", name: "Citibank", code: "023" },
  { id: "3", name: "Diamond Bank", code: "063" },
  { id: "4", name: "Dynamic Standard Bank", code: "" },
  { id: "5", name: "Ecobank Nigeria", code: "050" },
  { id: "6", name: "Fidelity Bank Nigeria", code: "070" },
  { id: "7", name: "First Bank of Nigeria", code: "011" },
  { id: "8", name: "First City Monument Bank", code: "214" },
  { id: "9", name: "Guaranty Trust Bank", code: "058" },
  { id: "10", name: "Heritage Bank Plc", code: "030" },
  { id: "11", name: "Jaiz Bank", code: "301" },
  { id: "12", name: "Keystone Bank Limited", code: "082" },
  { id: "13", name: "Providus Bank Plc", code: "101" },
  { id: "14", name: "Polaris Bank", code: "076" },
  { id: "15", name: "Stanbic IBTC Bank Nigeria Limited", code: "221" },
  { id: "16", name: "Standard Chartered Bank", code: "068" },
  { id: "17", name: "Sterling Bank", code: "232" },
  { id: "18", name: "Suntrust Bank Nigeria Limited", code: "100" },
  { id: "19", name: "Union Bank of Nigeria", code: "032" },
  { id: "20", name: "United Bank for Africa", code: "033" },
  { id: "21", name: "Unity Bank Plc", code: "215" },
  { id: "22", name: "Wema Bank", code: "035" },
  { id: "23", name: "Zenith Bank", code: "057" },
];
const GetBankName = (bankID) => {
  const f = Banks.filter((b) => b.id === bankID);
  if (f.length > 0) {
    return f[0].name;
  }
  return "";
};
module.exports = {
  CreateEncryptedPassword,
  Banks,
  GetBankName,
};
