// routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile, getAllUsersController, toggleUserFreezeController  } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/admin/users", getAllUsersController);
router.put("/admin/freeze/:id", toggleUserFreezeController);

export default router;
