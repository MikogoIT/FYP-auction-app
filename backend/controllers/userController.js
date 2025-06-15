// controllers/userController.js
import { verifyToken } from "../utils/token.js";
import { getUserById, updateUserById, getAllUsers, toggleUserFrozenStatus } from "../models/userModel.js";
import { sql } from "../utils/db.js";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import { verifyToken } from "./utils/token.js";
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
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const userId = payload.userId;

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
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const userId = payload.userId;

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

