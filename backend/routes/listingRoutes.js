// routes/listingRoutes.js
import express from "express";
import {
  postListing,
  getListings,
  getListing,
  putListing,
  deleteListingById,
  getMyListingsHandler,
  getRecentListings,
  getAllListings
} from "../controllers/listingsController.js";

import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.get("/listings/recent", getRecentListings);
router.get("/listings", getListings);
router.post("/listings", requireLogin, postListing);

router.get("/listings/:id", getListing);
router.put("/listings/:id", requireLogin, putListing);
router.delete("/listings/:id", requireLogin, deleteListingById);

router.get("/mylistings", getMyListingsHandler);
router.get("/", getAllListings);

export default router;
