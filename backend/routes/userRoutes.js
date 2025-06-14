// routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile, getAllUsersController, toggleUserFreezeController, deleteUserController, searchUsersController  } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/admin/users", getAllUsersController);
router.put("/admin/freeze/:id", toggleUserFreezeController);
router.delete("/admin/delete/:id", deleteUserController);
router.get("/admin/search", searchUsersController);


export default router;
