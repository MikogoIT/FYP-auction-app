// routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.get("/profile", requireLogin, userController.getProfile);
router.put("/profile", requireLogin, userController.updateProfile);
router.get("/admin/users", requireLogin, userController.getAllUsersController);
router.put("/admin/freeze/:id", requireLogin, userController.toggleUserFreezeController);
router.delete("/admin/delete/:id", requireLogin, userController.deleteUserController);
router.get("/admin/search", requireLogin, userController.searchUsersController);
router.get("/displayPhoto",  requireLogin, userController.getDP);
router.put("/displayPhoto", requireLogin, userController.uplDP);

export default router;

