const User = require("../models/User");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ status: "success", data: { users } });
  } catch (err) {
    next(err);
  }
};
