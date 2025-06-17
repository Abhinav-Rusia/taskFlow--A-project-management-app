import Project from "../models/project.model.js";
import User from "../models/user.model.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { title, description, teamMembers, status, priority, startDate, dueDate } = req.body;

    const project = await Project.create({
      title,
      description,
      teamMembers,
      status,
      priority,
      startDate,
      dueDate,
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: "Something went wrong while creating project" });
  }
};

// Get all user's projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { teamMembers: req.user.id }
      ]
    }).populate('owner', 'username email').populate('teamMembers', 'username email');

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects
    });
  } catch (error) {
    console.error("Get all projects error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('teamMembers', 'username email');

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const userId = req.user.id;

    if (project.owner.toString() !== userId && !project.teamMembers.some(member => member._id.toString() === userId)) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this project" });
    }

    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project
    });
  } catch (error) {
    console.error("Get single project error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { title, description, teamMembers, status, priority, startDate, dueDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this project" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, teamMembers, status, priority, startDate, dueDate },
      { new: true }
    ).populate('owner', 'username email').populate('teamMembers', 'username email');

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
};
