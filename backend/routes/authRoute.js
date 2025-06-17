import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyUser,resendOTP } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import { validate,registerValidation,loginValidation,otpValidation } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", validate(registerValidation),registerUser);
router.post("/verify-otp", validate(otpValidation), verifyUser);
router.post("/resend-otp", resendOTP);
router.post("/login",  validate(loginValidation) , loginUser);

router.get("/me", authMiddleware, getCurrentUser);

export default router;