const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: is this task overdue?
taskSchema.virtual("isOverdue").get(function () {
  return this.dueDate && this.status !== "done" && new Date() > this.dueDate;
});

taskSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
