import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        // Validation
        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: "Username and email are required"
            });
        }

        // Check if username is taken by another user
        if (username) {
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: userId } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }

        // Check if email is taken by another user
        if (email) {
            const existingEmail = await User.findOne({ 
                email, 
                _id: { $ne: userId } 
            });
            
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already taken"
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username: username.trim(),
                email: email.toLowerCase().trim()
            },
            { new: true, runValidators: true }
        ).select("-password -otp -otpExpiry");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(userId, {
            password: hashedNewPassword
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
};

// Update profile picture
export const updateProfilePicture = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const userId = req.user.id;

        if (!profilePicture) {
            return res.status(400).json({
                success: false,
                message: "Profile picture URL is required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture },
            { new: true }
        ).select("-password -otp -otpExpiry");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile picture error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile picture"
        });
    }
};

// Get user activity stats
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password -otp -otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Basic stats based on your current user model
        const stats = {
            accountCreated: user.createdAt,
            lastUpdated: user.updatedAt,
            isVerified: user.isVerified,
            role: user.role,
            profileCompletion: calculateProfileCompletion(user),
            // Placeholder for future project/task stats
            totalProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0
        };

        res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user statistics"
        });
    }
};

// Helper function to calculate profile completion
const calculateProfileCompletion = (user) => {
    let completion = 0;
    const totalFields = 4; // username, email, profilePicture, isVerified
    
    if (user.username && user.username.trim() !== '') completion += 25;
    if (user.email && user.email.trim() !== '') completion += 25;
    if (user.profilePicture && user.profilePicture !== '') completion += 25;
    if (user.isVerified) completion += 25;

    return completion;
};

// Delete account (optional)
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required to delete account"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Delete user account
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete account"
        });
    }
};
