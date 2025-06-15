import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import { validate,registerValidation,loginValidation,otpValidation } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", validate(registerValidation),registerUser);
router.post("/verify-otp", validate(otpValidation), verifyUser);
router.post("/login",  validate(loginValidation) , loginUser);

router.get("/me", authMiddleware, getCurrentUser);

export default router;