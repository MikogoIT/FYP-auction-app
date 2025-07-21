// controllers/notificationController.js
import * as notificationModel from "../models/notificationModel.js";

export async function getMyNotifications(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const notifications = await notificationModel.getUnreadNotifications(userId);
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Get unread notifications error:", err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
}

export async function getAllNotifications(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const notifications = await notificationModel.getAllNotifications(userId);
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Get all notifications error:", err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
}

export async function markAllAsRead(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    await notificationModel.markNotificationsAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Failed to mark notifications" });
  }
}
