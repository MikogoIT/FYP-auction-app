// src/pages/MyListingsBids.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";

export default function MyListingsBids() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("⏳ Fetching bids on my listings…");
        const res = await fetch("/api/bids/MyListingsBids", {
          credentials: "include",
        });
        console.log("👉 Fetch response status:", res.status);
        const data = await res.json();
        console.log("📦 API returned:", data);
        if (!res.ok) throw new Error(data.message || "Unknown error");
        setBids(data.bids);
      } catch (err) {
        console.error("❌ Failed to fetch bids on listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    { field: "bid_id", headerName: "Bid ID", width: 100 },
    { field: "buyer_id", headerName: "Buyer ID", width: 100 },
    {
      field: "bid_amount",
      headerName: "Amount",
      width: 120,
      valueFormatter: ({ value }) =>
        value != null ? `$${Number(value).toFixed(2)}` : "",
    },
    {
      field: "created_at",
      headerName: "Bid Date",
      width: 180,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleString() : "",
    },
    { field: "listing_id", headerName: "Listing ID", width: 100 },
    {
      field: "listing_name",
      headerName: "Listing Name",
      width: 200,
      flex: 1,
    },
    {
      field: "end_date",
      headerName: "Ends",
      width: 180,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleString() : "",
    },
  ];

  // Remap each API object so DataGrid sees the fields it expects:
  const rows = bids.map((b) => ({
    id: b.bid_id,                    // required by DataGrid
    bid_id: b.bid_id,
    buyer_id: b.buyer_id,
    bid_amount: parseFloat(b.bid_amount),
    created_at: b.bid_created_at,    // <- from API
    listing_id: b.listing_id,
    listing_name: b.listing_name,
    end_date: b.listing_end_date,    // <- from API
  }));

  console.log("➡️ Rows for DataGrid:", rows);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        <div
          className="toggleButtons"
          style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/myListings")}
            sx={{
              borderRadius: "999px",
              borderColor: "grey.400",
              textTransform: "none",
              color: "grey.500",
              "&:hover": { borderColor: "grey.600" },
            }}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/myListingsBids")}
            sx={{
              borderRadius: "999px",
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              "&:hover": { borderColor: "primary.dark" },
            }}
          >
            Bids On My Listings
          </Button>
        </div>

        <div id="wideTitle" className="profileTitle">
          Bids on My Listings
        </div>

        <div style={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
