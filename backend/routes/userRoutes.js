// routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile, getAllUsersController, toggleUserFreezeController, deleteUserController, searchUsersController  } from "../controllers/userController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.get("/profile", requireLogin, getProfile);
router.put("/profile", requireLogin, updateProfile);
router.get("/admin/users", requireLogin, getAllUsersController);
router.put("/admin/freeze/:id", requireLogin, toggleUserFreezeController);
router.delete("/admin/delete/:id", requireLogin, deleteUserController);
router.get("/admin/search", requireLogin, searchUsersController);

export default router;
