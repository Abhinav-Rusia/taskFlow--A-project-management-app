import express from "express";
import {
    addComment,
    getTaskComments,
    updateComment,
    deleteComment,
    getUserComments,
    getComment,
    getProjectComments
} from "../controllers/commentController.js";
import authMiddleware from "../middleware/auth.js";
import { validate, commentValidation, commentUpdateValidation } from "../middleware/validation.js";

const router = express.Router();

// All comment routes require authentication
router.use(authMiddleware);

// Comment CRUD routes
router.post("/", validate(commentValidation), addComment);
router.get("/task/:taskId", getTaskComments);
router.get("/user", getUserComments);
router.get("/project/:projectId", getProjectComments);
router.get("/:commentId", getComment);
router.put("/:commentId", validate(commentUpdateValidation), updateComment);
router.delete("/:commentId", deleteComment);

export default router;
