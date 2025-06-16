// controllers/listingsModel.js
import {
  createListing,
  getActiveListings,
  getListingById,
  getSellerId,
  updateListing,
  deleteListing,
  getMyListings
} from "../models/listingsModel.js";
import { verifyToken } from "../utils/token.js";
import { sql } from "../utils/db.js";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import path from "path";

// FOR LISTING COVER PHOTO UPLOAD
// ——— configure GCS bucket ———
const gcs = new Storage();
const bucket = gcs.bucket("auctioneer-static-assets");

// ——— configure Multer ———
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only .jpg, .png, .webp allowed"));
  },
});

// POST /listings
export async function postListing(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  const { title, description, min_bid, end_date, category_id } = req.body;
  if (!title || !min_bid || !end_date || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await createListing(payload.userId, title, description, min_bid, end_date, category_id);
    res.status(201).json({ listing: result[0] });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
}

// GET /listings
export async function getListings(req, res) {
  try {
    const listings = await getActiveListings();
    res.json({ listings });
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

// GET /listings/:id
export async function getListing(req, res) {
  try {
    const result = await getListingById(req.params.id);
    if (result.length === 0) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing: result[0] });
  } catch (err) {
    console.error("Fetch listing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
}

// PUT /listings/:id
export async function putListing(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  const { title, description, min_bid, end_date } = req.body;
  if (!title || !min_bid || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(payload.userId)) {
      return res.status(403).json({ message: "Unauthorized to edit this listing" });
    }

    await updateListing(req.params.id, title, description, min_bid, end_date);
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
}

// DELETE /listings/:id
export async function deleteListingById(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(payload.userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this listing" });
    }

    await deleteListing(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
}

// GET /mylistings
export async function getMyListingsHandler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    const listings = await getMyListings(payload.userId);
    res.json({ listings });
  } catch (err) {
    console.error("Fetch my listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}


// GET /api/listingimg?listingId=<id>
export async function getListingImg(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  const listingId = req.query.listingId;
  if (!listingId) return res.status(400).json({ message: "Missing listingId parameter" });

  try {
    const result = await sql`
      SELECT image_url
      FROM auction_listings
      WHERE id = ${listingId}
    `;

    if (result.length === 0) return res.status(404).json({ message: "Listing not found" });
    res.json({ imageUrl: result[0].image_url });
  } catch (err) {
    console.error("Fetch listing image error:", err);
    res.status(500).json({ message: "Failed to fetch listing image" });
  }
}

// PUT /api/listingimg
export async function uplListingImg(req, res) {
  // --- AUTH FIRST ---
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }
  
  // --- THEN MULTER UPLOAD ---
  upload.single("image")(req, res, async (uploadErr) => {
    if (uploadErr instanceof multer.MulterError) {
      return res.status(400).json({ message: uploadErr.message });
    }
    if (uploadErr) {
      console.error("Upload middleware error:", uploadErr);
      return res.status(500).json({ message: "Upload middleware failure" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res.status(400).json({ message: "Invalid file extension." });
      }

      const filename = `listing_${req.body.listingId}_${Date.now()}${ext}`;
      const file = bucket.file(filename);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false,
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      await sql`
        UPDATE auction_listings
        SET image_url = ${publicUrl}
        WHERE id = ${req.body.listingId}
      `;

      return res.json({ imageUrl: publicUrl });
    } catch (err) {
      console.error("uplListingImg handler error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });
}

