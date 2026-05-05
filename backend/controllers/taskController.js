const Task = require("../models/Task");
const Project = require("../models/Project");
const { AppError } = require("../utils/errorHandler");

// Helper: check if user belongs to project
const assertProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", 404);

  const hasAccess =
    user.role === "admin" ||
    project.owner.equals(user._id) ||
    project.members.some((m) => m.equals(user._id));

  if (!hasAccess) throw new AppError("Access denied.", 403);
  return project;
};

exports.createTask = async (req, res, next) => {
  try {
    await assertProjectAccess(req.body.project, req.user);
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate("assignee createdBy", "name email");
    res.status(201).json({ status: "success", data: { task } });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignee) filter.assignee = req.query.assignee;

    // For overdue query
    if (req.query.overdue === "true") {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: "done" };
    }

    // Members only see tasks in their projects
    if (req.user.role !== "admin") {
      const myProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select("_id");
      filter.project = { $in: myProjects.map((p) => p._id) };
      if (req.query.project) filter.project = req.query.project; // override if specific
    }

    const tasks = await Task.find(filter)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort("-createdAt");

    res.status(200).json({ status: "success", results: tasks.length, data: { tasks } });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee createdBy", "name email")
      .populate("project", "name");

    if (!task) return next(new AppError("Task not found.", 404));
    await assertProjectAccess(task.project._id, req.user);
    res.status(200).json({ status: "success", data: { task } });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new AppError("Task not found.", 404));
    await assertProjectAccess(task.project, req.user);

    // Members can only update status of tasks assigned to them
    if (req.user.role === "member") {
      const allowed = ["status"];
      const keys = Object.keys(req.body);
      const forbidden = keys.filter((k) => !allowed.includes(k));
      if (forbidden.length) {
        return next(new AppError("Members can only update task status.", 403));
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignee createdBy", "name email").populate("project", "name");

    res.status(200).json({ status: "success", data: { task: updated } });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new AppError("Task not found.", 404));
    await assertProjectAccess(task.project, req.user);

    if (req.user.role === "member") {
      return next(new AppError("Members cannot delete tasks.", 403));
    }

    await task.deleteOne();
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

// Dashboard stats endpoint
exports.getDashboardStats = async (req, res, next) => {
  try {
    const projectFilter =
      req.user.role === "admin"
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const myProjects = await Project.find(projectFilter).select("_id");
    const projectIds = myProjects.map((p) => p._id);

    const [total, byStatus, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: new Date() },
        status: { $ne: "done" },
      }),
    ]);

    const statusMap = {};
    byStatus.forEach(({ _id, count }) => (statusMap[_id] = count));

    res.status(200).json({
      status: "success",
      data: {
        totalTasks: total,
        overdueCount: overdue,
        totalProjects: myProjects.length,
        statusBreakdown: {
          todo: statusMap.todo || 0,
          in_progress: statusMap.in_progress || 0,
          review: statusMap.review || 0,
          done: statusMap.done || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
