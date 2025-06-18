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
router.get("/listings", requireLogin, getListings);
router.post("/listings", requireLogin, postListing);

router.get("/listings/:id", requireLogin, getListing);
router.put("/listings/:id", requireLogin, putListing);
router.delete("/listings/:id", requireLogin, deleteListingById);

router.get("/mylistings", requireLogin, getMyListingsHandler);
router.get("/", requireLogin, getAllListings);

export default router;
