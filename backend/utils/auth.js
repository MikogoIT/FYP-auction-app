// utils/auth.js
import crypto from "crypto";
import { GoogleAuth } from 'google-auth-library';

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

export async function telegramGCPAuth(req, res) {
  const FUNCTION_URL = process.env.TELEGRAM_FUNCTION_URL;

  const userId = req.session.userId;
  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      // 1️⃣ Get an IdTokenClient scoped to your Function URL
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(FUNCTION_URL);

      // 2️⃣ Call the Function, passing along the user’s payload (if any)
      const response = await client.request({
      url: FUNCTION_URL,
      data: req.body,           // forward request body if you need
      headers: {
          'Content-Type': 'application/json',
      },
      });

      // 3️⃣ Return whatever the Function returned
      res.status(response.status).send(response.data);
  } catch (err) {
      console.error('Invoke failed:', err);
      res.status(500).send('Bot invocation error');
  }
};