import {
  getUnreadNotifications,
  markNotificationsAsRead,
} from "../models/notificationModel.js";

export async function getMyNotifications(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const notifications = await getUnreadNotifications(userId);
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Get notification error:", err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
}

export async function markAllAsRead(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    await markNotificationsAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Failed to mark notifications" });
  }
}