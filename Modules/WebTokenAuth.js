const jwt = require("jsonwebtoken");
const jwtSecret = process.env.secret;

const signAdminJWT = (userID) => {
  const token = jwt.sign({ userID }, jwtSecret, {
    expiresIn: "3d",
  });
  return token;
};

const signStudentJWT = (userID) => {
  const token = jwt.sign({ userID }, jwtSecret, {
    expiresIn: "3d",
  });
  return token;
};
const signSupervisorJWT = (userID) => {
  const token = jwt.sign({ userID }, jwtSecret, {
    expiresIn: "3d",
  });
  return token;
};

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    //Token is not present in headers
    res.json({
      auth: false,
      message: "Authentication token not found!",
    });
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        //An unlikely error occured while attempting to verify the token
        res.json({
          auth: false,
          message: "Failed to authenticate user",
        });
      } else {
        console.log(decoded);
        req.userID = decoded.userID;
        next();
      }
    });
  }
};

module.exports = {
  verifyJWT,
  signAdminJWT,
  signStudentJWT,
  signSupervisorJWT,
};
