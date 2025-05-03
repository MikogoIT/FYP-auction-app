import express from "express";
import { sql } from "../utils/db.js";
import { verifyToken } from "../utils/token.js";

const router = express.Router();


router.post("/listings", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    const payload = verifyToken(token);
  
    if (!payload) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }
  
    const { title, description, min_bid, end_date } = req.body;
  
    if (!title || !min_bid || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    try {
      const result = await sql`
        INSERT INTO auction_listings (seller_id, title, description, min_bid, end_date)
        VALUES (${payload.userId}, ${title}, ${description}, ${min_bid}, ${end_date})
        RETURNING *
      `;
      res.status(201).json({ listing: result[0] });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  router.get("/listings", async (req, res) => {
    try {
      const listings = await sql`
        SELECT l.id, l.title, l.description, l.min_bid, l.end_date, l.seller_id, u.username AS seller
        FROM auction_listings l
        JOIN users u ON l.seller_id = u.id
        WHERE l.is_active = true
        ORDER BY l.end_date ASC
      `;
      res.json({ listings });
    } catch (err) {
      console.error("Fetch listings error:", err);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });
  
// Get the details of a single product
router.get("/listings/:id", async (req, res) => {
    const listingId = req.params.id;
  
    try {
      const result = await sql`
        SELECT id, title, description, min_bid, end_date
        FROM auction_listings
        WHERE id = ${listingId}
      `;
  
      if (result.length === 0) {
        return res.status(404).json({ message: "Listing not found" });
      }
  
      res.json({ listing: result[0] });
    } catch (err) {
      console.error("Fetch listing error:", err);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

// Modify product (authentication required)
router.put("/listings/:id", async (req, res) => {
    const listingId = req.params.id;
    const token = req.headers.authorization?.split(" ")[1];
    const payload = verifyToken(token);
  
    if (!payload) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }
  
    const { title, description, min_bid, end_date } = req.body;
  
    if (!title || !min_bid || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    try {
      // Check if the product belongs to the current user
      const existing = await sql`
        SELECT seller_id FROM auction_listings WHERE id = ${listingId}
      `;
      if (existing.length === 0) {
        return res.status(404).json({ message: "Listing not found" });
      }
      if (Number(existing[0].seller_id) !== Number(payload.userId)) {
        return res.status(403).json({ message: "Unauthorized to edit this listing" });
      }      
  
      // Update product information
      await sql`
        UPDATE auction_listings
        SET title = ${title},
            description = ${description},
            min_bid = ${min_bid},
            end_date = ${end_date}
        WHERE id = ${listingId}
      `;
  
      res.json({ message: "Listing updated successfully" });
    } catch (err) {
      console.error("Update listing error:", err);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

// Delete listing (authentication required)
router.delete("/listings/:id", async (req, res) => {
  const listingId = req.params.id;
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  try {
    const existing = await sql`
      SELECT seller_id FROM auction_listings WHERE id = ${listingId}
    `;

    if (existing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (Number(existing[0].seller_id) !== Number(payload.userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this listing" });
    }

    await sql`
      DELETE FROM auction_listings WHERE id = ${listingId}
    `;

    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

  
  export default router;