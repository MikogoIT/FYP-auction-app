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
  
  export default router;

  router.get("/listings", async (req, res) => {
    try {
      const listings = await sql`
        SELECT l.id, l.title, l.description, l.min_bid, l.end_date, u.username AS seller
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
  