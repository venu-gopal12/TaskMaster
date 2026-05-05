const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/errorHandler");

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return next(new AppError("Not authenticated. Please log in.", 401));
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError("User no longer exists.", 401));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Role-based access control — pass allowed roles as args
// e.g. restrictTo("admin") or restrictTo("admin", "member")
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }
  next();
};

module.exports = { protect, restrictTo };
