import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (projectExists.owner.toString() !== req.user.id && !projectExists.teamMembers.includes(req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to create a task in this project" });
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
        })

        const populatedTask = await Task.findById(task._id).populate("project", "title").populate("assignedTo", "username email")

        res.status(201).json({
            message: "Task created successfully",
            task: populatedTask
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllTasks = async (req,res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check authorization

        if(project.owner.toString() !== req.user.id && !project.teamMembers.includes(req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to view tasks in this project" });
        }

        const tasks = await Task.find({ project: projectId }).populate("project", "title").populate("assignedTo", "username email").sort({ createdAt: -1 });

        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTask = async (req, res) => {
    try {
        
        const task = await Task.findById(req.params.id).populate("project", "title owner teamMembers").populate("assignedTo", "username email");

        if(!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check authorization

        if(task.project.owner.toString() !== req.user.id && !task.project.teamMembers.includes(req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to view this task" });
        }

        res.status(200).json({
            message: "Task fetched successfully",
            task
        })

    } catch (error) {
        res.status(500).json({message: error.message})    
    }
}

// Update task
export const updateTask = async (req, res) => {
    try {
        const { title, description, assignedTo, status, priority, dueDate } = req.body;
        
        const task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        // Check if user has access to the project
        if (task.project.owner.toString() !== req.user.id && 
            !task.project.teamMembers.includes(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, assignedTo, status, priority, dueDate },
            { new: true }
        ).populate('project', 'title')
         .populate('assignedTo', 'username email');
        
        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        // Check if user has access to the project
        if (task.project.owner.toString() !== req.user.id && 
            !task.project.teamMembers.includes(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        await Task.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tasks assigned to current user (across all projects)
export const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('project', 'title')
            .populate('assignedTo', 'username email')
            .sort({ dueDate: 1 });
        
        res.status(200).json({
            message: "Your tasks fetched successfully",
            tasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};