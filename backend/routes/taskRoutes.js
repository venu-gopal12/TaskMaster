const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validate, taskSchema, taskUpdateSchema } = require("../middlewares/validate");

const router = express.Router();

router.use(protect);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

router
  .route("/")
  .post(restrictTo("admin"), validate(taskSchema), createTask)
  .get(getTasks);

router
  .route("/:id")
  .get(getTask)
  .patch(validate(taskUpdateSchema), updateTask)
  .delete(restrictTo("admin"), deleteTask);

module.exports = router;
