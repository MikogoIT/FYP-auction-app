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


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

// Enable JSON parsing
app.use(express.json());

// === API ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auctions", auctionRoutes);

// === React SPA fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
