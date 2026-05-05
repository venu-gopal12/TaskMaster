const User = require("../models/User");
const { sendToken } = require("../utils/jwt");
const { AppError } = require("../utils/errorHandler");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError("Email already registered.", 400));

    const user = await User.create({ name, email, password, role });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError("Invalid email or password.", 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
};
