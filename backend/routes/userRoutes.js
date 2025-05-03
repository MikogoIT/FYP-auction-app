// routes/userRoutes.js
import express from "express";
import { sql } from "../utils/db.js";
import { verifyToken } from "../utils/token.js";

const router = express.Router();

router.get("/profile", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
  
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }
  
    const userId = payload.userId;
  
    const result = await sql`
      SELECT username, email, phone_number, address
      FROM users
      WHERE id = ${userId}
    `;
  
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
  
    res.json({ user: result[0] });
  });

router.put("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const userId = payload.userId;
  const { username, phone_number, address } = req.body;

  try {
    const result = await sql`
      UPDATE users
      SET username = ${username},
          phone_number = ${phone_number},
          address = ${address}
      WHERE id = ${userId}
      RETURNING username, email, phone_number, address
    `;

    res.json({ user: result[0] });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;