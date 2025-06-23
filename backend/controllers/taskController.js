import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user can create tasks in this project
    if (
      projectExists.owner.toString() !== req.user.id &&
      !projectExists.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to create task in this project" });
    }

    // If assigning to someone, validate they're part of the project
    if (assignedTo) {
      const isOwner = projectExists.owner.toString() === assignedTo;
      const isMember = projectExists.teamMembers.some(member => member.toString() === assignedTo);
      
      if (!isOwner && !isMember) {
        return res.status(400).json({
          success: false,
          message: "Cannot assign task to user who is not part of the project"
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      priority: priority || 'low',
      dueDate,
      createdBy: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create task", 
      error: error.message 
    });
  }
};

// Get all tasks across all user's projects
export const getAllTasks = async (req, res) => {
  try {
    // Get all projects where user is owner or member
    const userProjects = await Project.find({
      $or: [
        { owner: req.user.id },
        { teamMembers: req.user.id }
      ]
    });

    const projectIds = userProjects.map(project => project._id);

    // Get all tasks from those projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tasks",
      error: error.message 
    });
  }
};

// Get all tasks for a specific project
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user has access to this project
    if (
      project.owner.toString() !== req.user.id &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to view tasks" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error('Get tasks by project error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tasks",
      error: error.message 
    });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    const task = await Task.findById(id)
      .populate("project", "title owner teamMembers")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if user has access to this task
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
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch task",
      error: error.message 
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, project, status, priority, dueDate, assignedTo } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
    }

    // Find the task first
    const existingTask = await Task.findById(id).populate('project');
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can update this task (creator or project owner/member)
    const canUpdate =
      existingTask.createdBy.toString() === req.user.id ||
      existingTask.project.owner.toString() === req.user.id ||
      existingTask.project.teamMembers.some(member => member.toString() === req.user.id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // If changing assignment, validate the new assignee
    if (assignedTo && assignedTo !== existingTask.assignedTo?.toString()) {
      const projectDoc = existingTask.project;
      const isOwner = projectDoc.owner.toString() === assignedTo;
      const isMember = projectDoc.teamMembers.some(member => member.toString() === assignedTo);
      
      if (!isOwner && !isMember) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to user who is not part of the project'
        });
      }
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        project,
        status,
        priority,
        dueDate,
        assignedTo: assignedTo || null,
      },
      { new: true, runValidators: true }
    )
      .populate('project', 'title')
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email');

    res.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    // Find the task first
    const existingTask = await Task.findById(id).populate('project');
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can delete this task (creator or project owner)
    const canDelete =
      existingTask.createdBy.toString() === req.user.id ||
      existingTask.project.owner.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};


// Get user's assigned and created tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: "Your tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch your tasks",
      error: error.message 
    });
  }
};

// Get tasks assigned to current user only
export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: "Assigned tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch assigned tasks",
      error: error.message 
    });
  }
};

// Get tasks created by current user
export const getCreatedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate("project", "title")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Created tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error('Get created tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch created tasks",
      error: error.message 
    });
  }
};
