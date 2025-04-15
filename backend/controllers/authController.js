// controllers/authController.js
import { sql } from "../utils/db.js"; 
import { comparePassword } from "../utils/auth.js";

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const result = await sql`
      SELECT id, email, password, role FROM users WHERE email = ${email}
    `;
    if (result.length === 0) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    const user = result[0];
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    res.json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}