// routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile, getAllUsersController } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/admin/users", getAllUsersController);

export default router;
