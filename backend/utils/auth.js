// utils/auth.js
import crypto from "crypto";

// SHA-256 
export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function comparePassword(inputPassword, storedHash) {
  return hashPassword(inputPassword) === storedHash;
}

// Telegram auth
export function requireBotAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token === process.env.BOT_SECRET) return next();
  return res.status(403).json({ message: "Forbidden" });
}