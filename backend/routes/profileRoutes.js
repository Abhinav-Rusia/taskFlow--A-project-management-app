import express from "express";
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    updateProfilePicture,
    getUserStats,
    deleteAccount
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Profile routes
router.get("/", getUserProfile);
router.put("/", updateUserProfile);
router.put("/change-password", changePassword);
router.put("/profile-picture", updateProfilePicture);
router.get("/stats", getUserStats);
router.delete("/delete-account", deleteAccount);

export default router;
