// utils/auth.js
import crypto from "crypto";

// SHA-256 
export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function comparePassword(inputPassword, storedHash) {
  return hashPassword(inputPassword) === storedHash;
}
