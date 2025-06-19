// routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.get("/admin/users", userController.getAllUsersController);
router.put("/admin/freeze/:id", userController.toggleUserFreezeController);
router.delete("/admin/delete/:id", userController.deleteUserController);
router.get("/admin/search", userController.searchUsersController);
router.get("/displayPhoto", userController.getDP);
router.put("/displayPhoto", userController.uplDP);

export default router;

