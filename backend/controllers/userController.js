// controllers/userController.js
import { getUserById, updateUserById, getAllUsers, toggleUserFrozenStatus } from "../models/userModel.js";
import { sql } from "../utils/db.js";

// Get user profile
export async function getProfile(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await getUserById(userId);
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result[0] });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { username, phone_number, address } = req.body;

  try {
    const result = await updateUserById(userId, username, phone_number, address);
    res.json({ user: result[0] });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

// Get all users (admins only)
export async function getAllUsersController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await getUserById(userId);

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

// Toggle user freeze status (admins only)
export async function toggleUserFreezeController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const requester = await getUserById(userId);
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

// Delete user (admins only)
export async function deleteUserController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const me = await getUserById(userId);
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

// Search users (admins only)
export async function searchUsersController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const me = await getUserById(userId);
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

