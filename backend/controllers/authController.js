// controllers/authController.js
import { sql } from "../utils/db.js"; 
import { comparePassword } from "../utils/auth.js";
import { hashPassword } from "../utils/auth.js";
import { createToken } from "../utils/token.js";

//login
export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const result = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `;
    if (result.length === 0) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    const user = result[0];
    const match = await comparePassword(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    res.json({ message: "Login successful", user: { id: user.id, token, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

//register
export async function registerUser(req, res) {
  const {
    username,
    email,
    password,
    full_name,
    phone_number,
    address
  } = req.body;

  if (!username || !email || !password || !full_name || !phone_number || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = hashPassword(password);

    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, full_name, phone_number, address)
      VALUES (${username}, ${email}, ${passwordHash}, ${full_name}, ${phone_number}, ${address})
      RETURNING id, username, email, full_name, phone_number, address
    `;

    res.status(201).json({
      message: "User registered successfully",
      user: newUser[0]
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}