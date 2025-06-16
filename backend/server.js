import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { neon } from "@neondatabase/serverless";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";


const app = express();
const PORT = process.env.PORT || 8080;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to Neon db
const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

// Enable JSON body parsing in advance
app.use(express.json());

//listing router
app.use("/api", listingRoutes);

//bid router
app.use("/api/bids", bidRoutes);

// category router
app.use("/api/categories", categoryRoutes);

// auction router
app.use("/api/auctions", auctionRoutes);


// 

// // Example API route that queries Neon DB
// app.get("/api/version", async (req, res) => {
//   try {
//     const result = await sql`SELECT version()`;
//     res.json({ version: result[0].version });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ error: "Database error" });
//   }
// });


// testing route 123
// Example API route that queries Neon DB
// app.get("/api/getAllUsers", async (req, res) => {
//   try {
//     const result = await sql`SELECT * FROM users`;
//     res.json(result);
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ error: "Database error" });
//   }
// });

//-------------------TEST Login--------------------//

app.use("/api", authRoutes);      
app.use("/api/users", userRoutes);
app.use("/api", userRoutes); 

//---------------------Test end--------------------//

// Testing Database - UserModel
app.get("/api/users", userRoutes);

// Fallback to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
