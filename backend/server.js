import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { neon } from "@neondatabase/serverless";

import { formatDbVersion, average, isValidEmail } from "./utils/functions.js";

import userRoutes from "userRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to Neon
const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

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
  const avg = average(6, 10); // 示例数值
  res.json({ average: avg });
});

app.get("/api/check-email", (req, res) => {
  const testEmail = "test@example.com";
  const valid = isValidEmail(testEmail);
  res.json({ email: testEmail, valid });
});
//-------------------------TEST END-----------------//

// Testing Database - UserModel
app.use(express.json());
app.use("/api/users", userRoutes);

// Fallback to React app
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
