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
import telegramRoutes from "./routes/telegramRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"
import watchlistRoutes from "./routes/watchlistRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";

import "./ScheduledJob/notifyEndingAuctions.js"
import "./ScheduledJob/notifyWinners.js"

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

// // Enable CORS
// app.use(cors({
//   origin: ["http://localhost:4433", ""], 
//   credentials: true
// }));

// listing router
app.use("/api", listingRoutes);

// bid router
app.use("/api/bids", bidRoutes);

// category router
app.use("/api/categories", categoryRoutes);

// Notification router
app.use("/api/notifications", notificationRoutes);

// watchlist router
app.use("/api/watchlist", watchlistRoutes);

// auction router
app.use("/api/auctions", auctionRoutes);

// Telegram router
app.use("/api/telegram", telegramRoutes);

// feedback router
app.use("/api/feedback", feedbackRoutes);

// tag router
app.use("/api", tagRoutes);

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
app.use("/api", userRoutes); 

//---------------------Test end--------------------//





//-------------------TEST telegram bot api --------//

import { GoogleAuth } from 'google-auth-library';

const FUNCTION_URL = process.env.TELEGRAM_FUNCTION_URL;

app.get('/api/tele', async (req, res) => {
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
});



//---------------------Test end--------------------//





//-------------------TEST notifications api --------//


const NOTIF_FN_URL = process.env.GET_NOTIF_FN_URL;

app.get('/api/getnotif', async (req, res) => {
  // 1️⃣ Check login
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 2️⃣ Prepare auth client
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(NOTIF_FN_URL);

  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError;

  // 3️⃣ Retry loop
  while (attempt < MAX_RETRIES) {
    try {
      const response = await client.request({
        url: NOTIF_FN_URL,
        method: 'POST',                   
        data: { userId },                 
        headers: { 'Content-Type': 'application/json' },
      });
      // success! immediately return
      return res.json(response.data);
    } catch (err) {
      attempt++;
      lastError = err;
      console.error(`Attempt ${attempt} failed to fetch notifications:`, err);
      if (attempt >= MAX_RETRIES) {
        console.error('Max retries reached. Aborting.');
        return res
          .status(500)
          .json({ error: 'Unable to fetch notifications after multiple attempts' });
      }
    }
  }
});



//---------------------Test end--------------------//

// Testing Database - UserModel
// app.get("/api/users", userRoutes);

// Fallback to React app
// deepcode ignore NoRateLimitingForExpensiveWebOperation: <please specify a reason of ignoring this>
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
