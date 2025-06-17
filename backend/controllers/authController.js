import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/emailServices.js";

// Register User
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please fill in all fields" 
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ 
                    success: false, 
                    message: "User already exists with this email" 
                });
            } else {
                // User exists but not verified, resend OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
                
                userExists.otp = otp;
                userExists.otpExpiry = otpExpiry;
                await userExists.save();
                
                // Send OTP email
                const emailResult = await sendOTPEmail(email, otp, username);
                if (!emailResult.success) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to send verification email"
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    message: "OTP resent to your email! Please check your inbox.",
                    userId: userExists._id
                });
            }
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: hashed,
            otp,
            otpExpiry,
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, username);
        if (!emailResult.success) {
            // Delete user if email fails
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            });
        }

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for OTP verification.",
            userId: user._id,
            email: user.email
            // ❗ Removed OTP from response for security
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to register user" 
        });
    }
};

// Verify User
export const verifyUser = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "User already verified" 
            });
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP" 
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP expired. Please request a new one." 
            });
        }

        // Verify user
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.username);

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
            expiresIn: "14d" 
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully! Welcome to TaskFlow! 🎉",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                isVerified: user.isVerified
            },
            token
        });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Verification failed" 
        });
    }
};

// ✅ New - Resend OTP
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, otp, user.username);
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email"
            });
        }

        res.status(200).json({
            success: true,
            message: "New OTP sent to your email! Please check your inbox."
        });

    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to resend OTP"
        });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: "Please verify your email first. Check your inbox for OTP.",
                needsVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "14d",
        });

        res.status(200).json({
            success: true,
            message: "Login successful! Welcome back! 👋",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                isVerified: user.isVerified
            },
            token,
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Login failed" 
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: "Please verify your email first",
                needsVerification: true
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Could not fetch user" 
        });
    }
};

