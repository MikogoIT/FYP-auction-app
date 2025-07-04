// controllers/userController.js
import { getUserById, updateUserById, getAllUsers, toggleUserFrozenStatus } from "../models/userModel.js";
import { sql } from "../utils/db.js";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import path from "path";



// FOR DISPLAY PHOTO UPLOAD
// ——— configure GCS bucket ———
const gcs = new Storage();
const bucket = gcs.bucket("auctioneer-dp-images");

// ——— configure Multer ———
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only .jpg, .png, .webp allowed"));
  },
});

export async function getDP(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await sql`
      SELECT id, username, profile_image_url
      FROM users
      WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];
    res.json({
      id: user.id,
      username: user.username,
      profile_image_url: user.profile_image_url,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
}



export async function uplDP(req, res) {
  // --- AUTH FIRST ---
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // --- THEN MULTER UPLOAD ---
  upload.single("image")(req, res, async (uploadErr) => {
    if (uploadErr instanceof multer.MulterError) {
      return res.status(400).json({ message: uploadErr.message });
    }
    if (uploadErr) {
      console.error("Upload middleware error:", uploadErr);
      return res.status(500).json({ message: "Upload middleware failure" });
    }

    try {
      // 3) ensure file present
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }
      // 4) validate extension
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res.status(400).json({ message: "Invalid file extension." });
      }

      // 5) upload to GCS
      const filename = `user_${userId}_${Date.now()}${ext}`;
      const file = bucket.file(filename);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false,
      });

      // 6) update DB
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      await sql`
        UPDATE users
        SET profile_image_url = ${publicUrl}
        WHERE id = ${userId}
      `;

      // 7) respond
      return res.json({ imageUrl: publicUrl });
    } catch (err) {
      console.error("uplDP handler error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });
}

// check if user is logged in
export async function checkAuth(req, res) {
  const userId = req.session.userId;
  if (!userId) {
    // this should never happen if `requireLogin` ran,
    // but it guards against a missing session anyway
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // \pull back some basic user info
    const result = await sql`
      SELECT id, username
      FROM users
      WHERE id = ${userId}
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id, username } = result[0];
    return res.json({
      authenticated: true,
      user: { id, username }
    });
  } catch (err) {
    console.error("DB error in checkAuth:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

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

// Admin update user details (admins only)
export async function adminUpdateUserController(req, res) {
  const adminId = req.session.userId;
  if (!adminId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const admin = await getUserById(adminId);
    if (!admin[0]?.is_admin) {
      return res.status(403).json({ message: "Only admins can perform this action" });
    }

    const { id } = req.params;
    const { username, phone_number, address } = req.body;

    const userToUpdate = await getUserById(id);
    if (userToUpdate.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToUpdate[0].is_admin) {
      return res.status(403).json({ message: "Cannot modify admin accounts" });
    }

    const result = await updateUserById(id, username, phone_number, address);
    res.json({ user: result[0] });
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
}