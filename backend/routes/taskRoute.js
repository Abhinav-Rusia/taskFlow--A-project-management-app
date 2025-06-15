import express from "express";
import {
    createTask,
    getAllTasks,
    getTask,
    updateTask,
    deleteTask,
    getMyTasks
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.js";
import { validate,taskValidation,taskUpdateValidation } from "../middleware/validation.js";

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD routes
router.post("/",validate(taskValidation),createTask);
router.get("/project/:projectId", getAllTasks);
router.get("/my-tasks", getMyTasks);
router.get("/:id", getTask);
router.put("/:id", validate(taskUpdateValidation),updateTask);
router.delete("/:id", deleteTask);

export default router;