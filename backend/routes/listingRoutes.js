// routes/listingRoutes.js
import express from "express";
import {
  postListing,
  getListings,
  getListing,
  putListing,
  deleteListingById,
  getMyListingsHandler
} from "../controllers/listingsController.js";

const router = express.Router();

router.post("/listings", postListing);
router.get("/listings", getListings);
router.get("/listings/:id", getListing);
router.put("/listings/:id", putListing);
router.delete("/listings/:id", deleteListingById);
router.get("/mylistings", getMyListingsHandler);

export default router;
