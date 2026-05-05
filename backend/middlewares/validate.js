const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join("; ");
    return res.status(400).json({ status: "fail", message });
  }
  next();
};

// ── Schemas ──────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("admin", "member"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const projectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  members: Joi.array().items(Joi.string()),
});

const taskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000),
  project: Joi.string().required(),
  assignee: Joi.string().allow(null, ""),
  status: Joi.string().valid("todo", "in_progress", "review", "done"),
  priority: Joi.string().valid("low", "medium", "high"),
  dueDate: Joi.date().allow(null),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().max(1000),
  assignee: Joi.string().allow(null, ""),
  status: Joi.string().valid("todo", "in_progress", "review", "done"),
  priority: Joi.string().valid("low", "medium", "high"),
  dueDate: Joi.date().allow(null),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  projectSchema,
  taskSchema,
  taskUpdateSchema,
};
