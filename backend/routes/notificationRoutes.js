// routes/notificationRoutes.js
import express from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", notificationController.getMyNotifications);
router.get("/all", notificationController.getAllNotifications);
router.post("/read", notificationController.markAllAsRead);

export default router;
