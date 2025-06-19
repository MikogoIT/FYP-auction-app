// routes/authRoutes.js
import express from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/register", registerUser);

export default router;
