const Project = require("../models/Project");
const { AppError } = require("../utils/errorHandler");

// Only admin can create; members can view their own projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
    });
    res.status(201).json({ status: "success", data: { project } });
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {} // admin sees all
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(filter)
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort("-createdAt");

    res.status(200).json({ status: "success", results: projects.length, data: { projects } });
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) return next(new AppError("Project not found.", 404));

    const isMember =
      req.user.role === "admin" ||
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m._id.equals(req.user._id));

    if (!isMember) return next(new AppError("Access denied.", 403));

    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError("Project not found.", 404));

    if (req.user.role !== "admin" && !project.owner.equals(req.user._id)) {
      return next(new AppError("Only the project owner or admin can update.", 403));
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("owner members", "name email");

    res.status(200).json({ status: "success", data: { project: updated } });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError("Project not found.", 404));

    // Only admin or owner
    if (req.user.role !== "admin" && !project.owner.equals(req.user._id)) {
      return next(new AppError("Only admin or project owner can delete.", 403));
    }

    await project.deleteOne();
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name email");

    if (!project) return next(new AppError("Project not found.", 404));
    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate("members", "name email");

    if (!project) return next(new AppError("Project not found.", 404));
    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    next(err);
  }
};
