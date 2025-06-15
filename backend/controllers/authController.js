import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Generate OTP

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashed,
            otp,
            otpExpiry,
        });

        res.status(201).json({
            message: "Registration successful! Please verify your email with the OTP.",
            id: user._id,
            username: user.username,
            email: user.email,
            otp : otp
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const verifyUser = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // update user and mark as verified

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "14d" });

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "14d",
        });

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}