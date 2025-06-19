import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { neon } from "@neondatabase/serverless";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";


const app = express();
const PORT = process.env.PORT || 8080;
// session
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL, 
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    sameSite: "lax",
    secure: false 
  }
}));

console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

//----------------------------------------------------------------------------------
// Test session handling
app.get("/api/session-test", (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`You have visited this page ${req.session.views} times`);
  } else {
    req.session.views = 1;
    res.send("Welcome! This is your first visit.");
  }
});
// test session end
//----------------------------------------------------------------------------------

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to Neon db
const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

// Enable JSON body parsing in advance
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: "http://localhost:4433", 
  credentials: true
}));

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

//---------------------Test end--------------------//

// Testing Database - UserModel
// app.get("/api/users", userRoutes);

// Fallback to React app
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
