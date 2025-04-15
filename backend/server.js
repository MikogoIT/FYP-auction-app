import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { neon } from "@neondatabase/serverless";

import { formatDbVersion, average, isValidEmail } from "./utils/functions.js";

import userRoutes from "./userRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to Neon
const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

// **Enable JSON body parsing in advance**
app.use(express.json());

// Example API route that queries Neon DB
app.get("/api/version", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.json({ version: result[0].version });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

//-------------------------TEST START---------------------//
app.get("/api/average", (req, res) => {
  const a = parseFloat(req.query.a);
  const b = parseFloat(req.query.b);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).json({ error: "Invalid input numbers" });
  }

  const avg = average(a, b);
  res.json({ average: avg });
});

app.get("/api/check-email", (req, res) => {
  const testEmail = "test@example.com";
  const valid = isValidEmail(testEmail);
  res.json({ email: testEmail, valid });
});
//-------------------------TEST END-----------------//

//-------------------TEST Login--------------------//

// POST /api/login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  // Simple verification
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are both required" });
  }

  try {
    // Check User
    const users = await sql`
      SELECT id, password, role
      FROM users
      WHERE email = ${email}
    `;
    if (users.length === 0) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    const user = users[0];
    // Verify Password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    // Generating JWT
    const token = generateToken({ id: user.id, role: user.role });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login exception: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//---------------------Test end--------------------//

// Testing Database - UserModel
app.use(express.json());
app.get("/api/users", userRoutes);

// Fallback to React app
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
