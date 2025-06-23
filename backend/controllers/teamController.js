import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Invitation from "../models/invitation.model.js";
import crypto from "crypto";
import { sendInvitationEmail } from "../services/emailServices.js"; // You'll need to create this

// Search users for team invitation
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
       
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const users = await User.find({
      $and: [
        { isVerified: true },
        { _id: { $ne: req.user.id } }, 
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select("username email")
    .limit(10);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users"
    });
  }
};


// Invite user to project
export const inviteToProject = async (req, res) => {
  try {
    const { email, projectId, message } = req.body;
    
    if (!email || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Email and project ID are required"
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can invite members"
      });
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found"
      });
    }

    if (project.teamMembers.includes(invitedUser._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a team member"
      });
    }
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { teamMembers: invitedUser._id }
    });

    res.status(201).json({
      success: true,
      message: "User added to project successfully"
    });
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add user to project"
    });
  }
};


// Get project invitations
export const getProjectInvitations = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view invitations"
      });
    }

    const invitations = await Invitation.find({ project: projectId })
      .populate('invitedBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invitations
    });

  } catch (error) {
    console.error("Get invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitations"
    });
  }
};

// Accept invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('project');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired invitation"
      });
    }

    // Check if the current user's email matches the invitation
    const user = await User.findById(req.user.id);
    if (user.email !== invitation.email) {
      return res.status(403).json({
        success: false,
        message: "This invitation is not for your email address"
      });
    }

    // Add user to project team members
    await Project.findByIdAndUpdate(invitation.project._id, {
      $addToSet: { teamMembers: req.user.id }
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      project: invitation.project
    });

  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation"
    });
  }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can remove team members"
      });
    }

    // Remove user from team members
    await Project.findByIdAndUpdate(projectId, {
      $pull: { teamMembers: userId }
    });

    res.status(200).json({
      success: true,
      message: "Team member removed successfully"
    });

  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove team member"
    });
  }
};
