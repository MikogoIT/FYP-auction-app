import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { neon } from "@neondatabase/serverless";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to Neon
const sql = neon(process.env.DATABASE_URL);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

// Enable JSON body parsing in advance
app.use(express.json());

//listing router
app.use("/api", listingRoutes);

//bid router
app.use("/api/bids", bidRoutes);

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

//--=============-TEST display photo image upload-=============-//

// TEST - get the display photo URL
app.get("/api/getDP", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const userId = payload.userId;

  try {
    const result = await sql`
      SELECT id, username, profile_image_url
      FROM users
      WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];
    res.json({
      id: user.id,
      username: user.username,
      profile_image_url: user.profile_image_url,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// TEST - upload the display photo
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import { verifyToken } from "./utils/token.js";


const storage = new Storage();
const bucket = storage.bucket("auctioneer-dp-images");
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, and .webp images are allowed"));
    }
  },
});

app.post("/api/uploadDpImgTest", upload.single("image"), async (req, res) => {
  try {
    // ✅ Verify token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

    const userId = payload.userId;
    if (!req.file) return res.status(400).send("No file uploaded.");

    // ✅ Validate filename to avoid malicious names
    const extension = path.extname(req.file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(extension)) {
      return res.status(400).send("Invalid file extension");
    }

    const safeFilename = `user_${userId}_${Date.now()}${extension}`;
    const file = bucket.file(safeFilename);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
      resumable: false, // safer for small files
    });

    stream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).send("Upload failed");
    });

    stream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      try {
        await sql`
          UPDATE users
          SET profile_image_url = ${publicUrl}
          WHERE id = ${userId}
        `;
        res.json({ imageUrl: publicUrl });
      } catch (dbErr) {
        console.error("DB update error:", dbErr);
        res.status(500).send("Failed to update user in DB.");
      }
    });

    stream.end(req.file.buffer);
  } catch (err) {
    console.error("Unhandled exception:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).send("File too large or invalid");
    }
    res.status(500).send("Server error");
  }
});


//--=============-TEST end -=============-//


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
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
