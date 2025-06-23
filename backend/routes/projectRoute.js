import express from "express";
import { createProject, getAllProjects, getProject, updateProject, deleteProject, getProjectMembers } from "../controllers/projectController.js";
import authMiddleware from "../middleware/auth.js"
import { validate, projectValidation, projectUpdateValidation } from "../middleware/validation.js";

const router = express.Router();

router.use(authMiddleware);

// Project CRUD routes

router.post("/", validate(projectValidation), createProject);
router.get("/", getAllProjects);
router.get("/:id", getProject);
router.put("/:id", validate(projectUpdateValidation), updateProject);
router.delete("/:id", deleteProject);

// Project members route
router.get('/:projectId/members', authMiddleware, getProjectMembers);

export default router;
