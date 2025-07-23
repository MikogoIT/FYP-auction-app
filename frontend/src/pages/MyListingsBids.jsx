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
        console.log("👉 Fetch response status:", res.status, res);
        const data = await res.json();
        console.log("📦 API returned:", data);

        if (!res.ok) {
          console.error("❌ API error message:", data.message);
          throw new Error(data.message || "Unknown error");
        }

        if (!Array.isArray(data.bids)) {
          console.warn("⚠️ Unexpected `bids` type:", typeof data.bids, data.bids);
        }

        setBids(data.bids);
        console.log("✅ Bids state set:", data.bids);
      } catch (err) {
        console.error("Failed to fetch bids on listings:", err);
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
      valueFormatter: (params) => {
        const v = params?.value;
        return v != null ? `$${Number(v).toFixed(2)}` : "";
      },
    },
    {
      field: "created_at",
      headerName: "Bid Date",
      width: 180,
      valueFormatter: (params) => {
        const v = params?.value;
        return v ? new Date(v).toLocaleString() : "";
      },
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
      valueFormatter: (params) => {
        const v = params?.value;
        return v ? new Date(v).toLocaleString() : "";
      },
    },
  ];

  const rows = bids.map((b) => {
    const row = { id: b.bid_id, ...b };
    console.log("➡️ row prepared for DataGrid:", row);
    return row;
  });

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

        {/* Page title */}
        <div id="wideTitle" className="profileTitle">
          Bids on My Listings
        </div>

        {/* Data Grid */}
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
