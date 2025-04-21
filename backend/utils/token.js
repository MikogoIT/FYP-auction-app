// utils/token.js
import crypto from "crypto";

const SECRET = process.env.TOKEN_SECRET || "your_simple_secret";

export function createToken(userId) {
  const payload = `userId=${userId}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}&sig=${signature}`;
}

export function verifyToken(token) {
    if (!token) return null;
  
    const parts = token.split("&");
    const data = {};
    let sig = null;
  
    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "sig") {
        sig = value;
      } else {
        data[key] = value;
      }
    }
  
    const raw = parts.filter(p => !p.startsWith("sig=")).join("&");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
  
    if (expectedSig === sig) {
      return data; // e.g. { userId: '3' }
    } else {
      return null;
    }
  }
