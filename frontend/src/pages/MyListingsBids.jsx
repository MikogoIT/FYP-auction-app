// src/pages/MyListingsBids.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

export default function MyListingsBids() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      console.log("⏳ Starting fetch of MyListingsBids…");
      try {
        const res = await fetch("/api/bids/MyListingsBids", {
          credentials: "include",
        });
        console.log("👉 Fetch response status:", res.status);
        const json = await res.json();
        console.log("📦 Raw JSON:", json);
        if (!res.ok) throw new Error(json.message || `Status ${res.status}`);
        const data = Array.isArray(json.bids) ? json.bids : [];
        console.log("✅ Parsed bids array:", data);
        setBids(data);
      } catch (err) {
        console.error("❌ Failed to fetch bids:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // map API objects into DataGrid rows

  const rows = bids.map((b) => ({
    id:           b.bid_id,
    listing_name: b.listing_name,
    buyer_name:   b.buyer_name ?? "(no name)",
    bid_amount: parseFloat(b.bid_amount),
    created_at:   b.bid_created_at ? new Date(b.bid_created_at) : null,
    end_date:     b.listing_end_date ? new Date(b.listing_end_date) : null,
  }));

  const columns = [
    { field: "bid_id",     headerName: "Bid ID",      width: 100 },
    { field: "buyer_name", headerName: "Buyer Name",  width: 180, flex: 1 },
    { field: 'bid_amount', headerName: 'Bid Amount ($)', type: 'number', width: 130 },
    { field: 'created_at', headerName: 'Placed On', type: 'dateTime', width: 180 },
    { field: 'listing_name', headerName: 'Listing', flex: 1, minWidth: 150 },
    { field: 'end_date', headerName: 'Ends On', type: 'dateTime', width: 180 },
  ];

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* Toggle Buttons */}
        <div
          className="toggleButtons"
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            width: "100%",
          }}
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
            onClick={() => navigate("/mylistings/MyListingsBids")}
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

        {/* Data Grid */}
        <div style={{ width: "100%" }}>
          <DataGrid
            autoHeight
            loading={loading}
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{
              fontSize: "16px",
              "& .MuiDataGrid-columnHeader": { fontSize: "16px" },
              "& .MuiDataGrid-cell": { fontSize: "16px" },
              "& .MuiDataGrid-footerContainer": { fontSize: "16px" },
            }}
          />
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
