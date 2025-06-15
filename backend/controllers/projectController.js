import Project from "../models/project.model.js";
import User from "../models/user.model.js";

// Create Project

export const createProject = async (req, res) => {
    try {

        const { title, description, owner, teamMembers, status, priority } = req.body;

        const project = await Project.create({
            title,
            description,
            teamMembers,
            status,
            priority,
            owner: req.user.id
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
            message: "Projects fetched successfully",
            projects
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get single project

export const getProject = async (req, res) => {

    try {
        const project = await Project.findById(req.params.id).populate('owner', 'username email').populate('teamMembers', 'username email');
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Checking if user has access to this project

        if (project.owner.toString() !== req.user.id && !project.teamMembers.some(member => member._id.toString() === req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to view this project" });
        }

        res.status(200).json({
            message: "Project fetched successfully",
            project
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Update Project

export const updateProject = async (req, res) => {
    try {

        const { title, description, teamMembers, status, priority, startDate, dueDate } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this project" });
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, {
            title,
            description,
            teamMembers,
            status,
            priority,
            startDate,
            dueDate
        }, { new: true }).populate('owner', 'username email').populate('teamMembers', 'username email');

        res.status(200).json({
            message: "Project updated successfully",
            project : updatedProject
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Delete Project

export const deleteProject = async (req, res) => {
    try {

        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this project" });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Project deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}