// controllers/listingsController.js
import {
  createListing,
  getActiveListings,
  getListingById,
  getSellerId,
  updateListing,
  deleteListing,
  getMyListings,
  getListingsWithFilters,
  getCurrentDescendingPrice,
  getAuctionPeople 
} from "../models/listingsModel.js";
import { getRecentListings as fetchRecentListings } from "../models/listingsModel.js";
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
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const {
    title,
    description,
    min_bid,
    end_date,
    category_id,
    auction_type,
    start_price,
    discount_percentage 
  } = req.body;

  // Basic required fields
  if (!title || !end_date || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // validate auction_type
  if (!["ascending", "descending"].includes(auction_type)) {
    return res.status(400).json({ message: "Invalid auction_type" });
  }

  if (auction_type === "ascending") {
    // ascending requires min_bid
    if (!min_bid) {
      return res.status(400).json({ message: "Missing min_bid for ascending auction" });
    }
  }

  // descending auction only requires validation for start_price and discount_percentage
  if (auction_type === "descending") {
    if (!start_price || !min_bid || !discount_percentage || discount_percentage < 10) {
      return res.status(400).json({ message: "Missing or invalid descending auction fields" });
    }
  }

  try {
    const result = await createListing(
      userId,
      title,
      description,
      min_bid,
      end_date,
      category_id,
      auction_type,
      start_price,
      discount_percentage 
    );
    res.status(201).json({ listing: result[0] });
  } catch (err) {
    console.error("Create listing error:", err);
    // Send detailed error message back for dev purpose (optional)
    res.status(500).json({ message: "Failed to create listing", error: err.message });
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

    const listing = result[0];

    const now = new Date();
    const endDate = new Date(listing.end_date);
    if (listing.is_active && now > endDate) {
      await sql`
        UPDATE auction_listings SET is_active = false WHERE id = ${listing.id}
      `;
      listing.is_active = false;
    }
    
    if (listing.auction_type === "descending") {
      listing.current_price = await getCurrentDescendingPrice(req.params.id);
    }
    res.json({ listing });
  } catch (err) {
    console.error("Fetch listing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
}

// PUT /listings/:id
export async function putListing(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const {
    title,
    description,
    min_bid,
    end_date,
    auction_type = "ascending",
    start_price,
    discount_percentage 
  } = req.body;

  if (!title || !min_bid || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["ascending", "descending"].includes(auction_type)) {
    return res.status(400).json({ message: "Invalid auction_type" });
  }

  if (auction_type === "descending") {
    if (!start_price || !discount_percentage) {
      return res.status(400).json({ message: "Missing descending auction fields" });
    }
  }

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(userId)) {
      return res.status(403).json({ message: "Unauthorized to edit this listing" });
    }

    await updateListing(
      req.params.id,
      title,
      description,
      min_bid,
      end_date,
      auction_type,
      start_price,
      discount_percentage 
    );
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
}

// DELETE /listings/:id
export async function deleteListingById(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(userId)) {
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
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const listings = await getMyListings(userId);
    res.json({ listings });
  } catch (err) {
    console.error("Fetch my listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

export async function getRecentListings(req, res) {
  try {
    const listings = await fetchRecentListings();
    res.json({ listings });
  } catch (err) {
    console.error("Fetch recent listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}
export async function getAllListings(req, res) {
  const { q = "", category = "" } = req.query;

  try {
    const listings = await getListingsWithFilters(q, category);
    res.json({ listings });
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

// GET /api/listingimg?listingId=<id>
export async function getListingImg(req, res) {
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
  
  // --- MULTER UPLOAD ---
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


// GET /listings/:id/people
export async function getAuctionPeopleController(req, res) {
  try {
    const auctionId = req.params.id;
    const rows = await getAuctionPeople(auctionId);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Auction or participants not found" });
    }

    const {
      listing_title,
      seller_id,
      buyer_id,
      buyer_username,
      buyer_profile_image_url,
      seller_username,
      seller_profile_image_url,
      auction_image_url,
    } = rows[0];

    res.json({
      listingTitle: listing_title,
      buyer: {
        id: buyer_id,
        username: buyer_username,
        profileImageUrl: buyer_profile_image_url,
      },
      seller: {
        id: seller_id,
        username: seller_username,
        profileImageUrl: seller_profile_image_url,
      },
      coverImageUrl: auction_image_url,
    });
  } catch (err) {
    console.error("Fetch auction people error:", err);
    res.status(500).json({ message: "Failed to fetch auction participants" });
  }
}