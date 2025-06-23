import Comment from "../models/comment.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

// Add comment to task
export const addComment = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    if (!content || !taskId) {
      return res.status(400).json({
        success: false,
        message: "Content and task ID are required"
      });
    }

    // Check if task exists and user has permission
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to comment on this task"
      });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      task: taskId,
      author: req.user.id
    });

    // Add comment to task
    await Task.findByIdAndUpdate(taskId, {
      $push: { comments: comment._id }
    });

    // Populate comment with author info
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username email profilePicture');

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment
    });

  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment"
    });
  }
};

// Get task comments
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and user has permission
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view comments"
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'username email profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments
    });

  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments"
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Only comment author can update
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments"
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content, 
        isEdited: true, 
        editedAt: new Date() 
      },
      { new: true }
    ).populate('author', 'username email profilePicture');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment
    });

  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment"
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Only comment author can delete
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments"
      });
    }

    // Remove comment from task
    await Task.findByIdAndUpdate(comment.task, {
      $pull: { comments: commentId }
    });

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment"
    });
  }
};

// Get all comments by user (optional - for user activity)
export const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.user.id })
      .populate('task', 'title')
      .populate('task.project', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      comments
    });

  } catch (error) {
    console.error("Get user comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user comments"
    });
  }
};

// Get comment by ID (optional - for single comment view)
export const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'username email profilePicture')
      .populate('task', 'title project')
      .populate('task.project', 'title owner teamMembers');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check permissions - user must be part of the project
    const task = await Task.findById(comment.task._id).populate('project');
    if (
      task.project.owner.toString() !== req.user.id &&
      !task.project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this comment"
      });
    }

    res.status(200).json({
      success: true,
      comment
    });

  } catch (error) {
    console.error("Get comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment"
    });
  }
};

// Get recent comments for a project (optional - for project activity feed)
export const getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 20 } = req.query;

    // Check if project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (
      project.owner.toString() !== req.user.id &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view project comments"
      });
    }

    // Get all tasks for this project
    const tasks = await Task.find({ project: projectId }).select('_id');
    const taskIds = tasks.map(task => task._id);

    // Get comments for all tasks in this project
    const comments = await Comment.find({ task: { $in: taskIds } })
      .populate('author', 'username email profilePicture')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      comments
    });

  } catch (error) {
    console.error("Get project comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project comments"
    });
  }
};
