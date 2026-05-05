const express = require("express");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validate, projectSchema } = require("../middlewares/validate");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(restrictTo("admin"), validate(projectSchema), createProject)
  .get(getProjects);

router
  .route("/:id")
  .get(getProject)
  .patch(restrictTo("admin"), updateProject)
  .delete(restrictTo("admin"), deleteProject);

// Team management routes under project
router.post("/:id/members", restrictTo("admin"), addMember);
router.delete("/:id/members/:userId", restrictTo("admin"), removeMember);

module.exports = router;
