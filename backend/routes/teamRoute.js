import express from "express";
import {
    searchUsers,
    inviteToProject,
    getProjectInvitations,
    acceptInvitation,
    removeTeamMember
} from "../controllers/teamController.js";
import authMiddleware from "../middleware/auth.js";
import { validate, invitationValidation } from "../middleware/validation.js";

const router = express.Router();

// All team routes require authentication
router.use(authMiddleware);

// User search and team management routes
router.get("/search-users", searchUsers);
router.post("/invite", validate(invitationValidation), inviteToProject);
router.get("/invitations/:projectId", getProjectInvitations);
router.post("/accept-invitation/:token", acceptInvitation);
router.delete("/remove/:projectId/:userId", removeTeamMember);

export default router;
