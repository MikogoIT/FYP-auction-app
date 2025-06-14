// controllers/userController.js
import { verifyToken } from "../utils/token.js";
import { getUserById, updateUserById, getAllUsers, toggleUserFrozenStatus } from "../models/userModel.js";

export async function getProfile(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  try {
    const result = await getUserById(payload.userId);
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result[0] });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

export async function updateProfile(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const { username, phone_number, address } = req.body;

  try {
    const result = await updateUserById(payload.userId, username, phone_number, address);
    res.json({ user: result[0] });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

export async function getAllUsersController(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await getUserById(payload.userId);

    if (result.length === 0 || !result[0].is_admin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const users = await getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error("Fetch all users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function toggleUserFreezeController(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const requester = await getUserById(payload.userId);
    if (!requester[0]?.is_admin) {
      return res.status(403).json({ message: "Only admins can perform this action" });
    }

    const targetUserId = req.params.id;
    const updated = await toggleUserFrozenStatus(targetUserId);
    res.json({ message: "User status updated", user: updated[0] });
  } catch (err) {
    console.error("Freeze/unfreeze error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
