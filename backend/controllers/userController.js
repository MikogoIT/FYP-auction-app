// controllers/userController.js
import { verifyToken } from "../utils/token.js";
import { getUserById, updateUserById, getAllUsers, toggleUserFrozenStatus } from "../models/userModel.js";
import { sql } from "../utils/db.js";


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

export async function deleteUserController(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  try {
    const me = await getUserById(payload.userId);
    if (!me[0]?.is_admin) {
      return res.status(403).json({ message: "Only admins can delete users" });
    }

    const { id } = req.params;
    const userToDelete = await getUserById(id);

    if (userToDelete.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete[0].is_admin) {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await sql`DELETE FROM users WHERE id = ${id}`;
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
}

export async function searchUsersController(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  try {
    const me = await getUserById(payload.userId);
    if (!me[0]?.is_admin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const raw = req.query.q;
    const keyword = typeof raw === "string" ? raw.trim() : "";

    if (keyword.length < 2) {
      return res.status(400).json({ message: "Please enter at least 2 characters to search" });
    }

    const results = await sql`
      SELECT id, username, email, phone_number, is_admin, is_frozen
      FROM users
      WHERE username ILIKE ${`%${keyword}%`} OR email ILIKE ${`%${keyword}%`}
      ORDER BY id ASC
    `;

    res.json({ users: results });
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ message: "Search failed" });
  }
}

