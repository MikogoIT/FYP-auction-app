// routes/listingRoutes.js
import express from "express";
import * as listingsController from "../controllers/listingsController.js";

import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.get("/listings/recent", listingsController.getRecentListings);
router.post("/listings", listingsController.postListing);
router.get("/listings", listingsController.getAllListings);
router.get("/listings/:id", listingsController.getListing);
router.put("/listings/:id", listingsController.putListing);
router.delete("/listings/:id", listingsController.deleteListingById);
router.get("/mylistings", listingsController.getMyListingsHandler);
router.get("/listingimg", listingsController.getListingImg);
router.put("/listingimg", listingsController.uplListingImg);
// router.get("/", requireLogin, listingsController.getAllListings);

export default router;

