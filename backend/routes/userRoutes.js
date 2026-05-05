const express = require("express");
const { getAllUsers } = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Only admin can get all users
router.get("/", protect, restrictTo("admin"), getAllUsers);

module.exports = router;
