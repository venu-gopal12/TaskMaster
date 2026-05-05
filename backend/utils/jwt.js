const jwt = require("jsonwebtoken");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // never send hash
  res.status(statusCode).json({ status: "success", token, data: { user } });
};

module.exports = { signToken, sendToken };
