import express from "express";
import {
  getMyNotifications,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getMyNotifications);
router.post("/read", markAllAsRead);

export default router;
