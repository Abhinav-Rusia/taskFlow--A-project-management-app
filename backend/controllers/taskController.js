import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (
      projectExists.owner.toString() !== req.user.id &&
      !projectExists.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to create task in this project" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      createdBy: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "username email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

// Get all tasks for a project
export const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (
      project.owner.toString() !== req.user.id &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to view tasks" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title owner teamMembers")
      .populate("assignedTo", "username email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this task" });
    }

    res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      task
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this task" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, priority, dueDate },
      { new: true }
    )
      .populate("project", "title")
      .populate("assignedTo", "username email");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

// Get all tasks assigned to current user
// export const getMyTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedTo: req.user.id })
//       .populate("project", "title")
//       .populate("assignedTo", "username email")
//       .sort({ dueDate: 1 });

//     res.status(200).json({
//       success: true,
//       message: "Your tasks fetched successfully",
//       tasks
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to fetch your tasks" });
//   }
// };

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { assignedTo: req.user.id },
        { assignedTo: { $exists: false } }, // ✅ Include tasks with no assignedTo
        { createdBy: req.user.id }  // ✅ Include tasks created by user (if you have this field)
      ]
    })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .sort({ dueDate: 1 });

    console.log(`📋 Found ${tasks.length} tasks for user ${req.user.id}`); // ✅ Debug log

    res.status(200).json({
      success: true,
      message: "Your tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch your tasks" });
  }
};
