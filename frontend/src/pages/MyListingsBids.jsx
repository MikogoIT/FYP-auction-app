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
      try {
        const res = await fetch("/api/bids/MyListingsBids", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        const { bids: data } = await res.json();
        setBids(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch bids on listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Convert your API fields into exactly what DataGrid expects:
  const rows = bids.map((b) => ({
    id: b.bid_id,                                // DataGrid’s required unique id
    buyer_id: b.buyer_id,
    bid_amount: parseFloat(b.bid_amount),        // make it a number
    created_at: b.bid_created_at
      ? new Date(b.bid_created_at)
      : null,                                     // make it a Date
    listing_id: b.listing_id,
    listing_name: b.listing_name,
    end_date: b.listing_end_date
      ? new Date(b.listing_end_date)
      : null,                                     // make it a Date
  }));

  const columns = [
    { field: "id",           headerName: "Bid ID",      width: 100 },
    { field: "buyer_id",     headerName: "Buyer ID",    width: 100 },
    {
      field: "bid_amount",
      headerName: "Amount ($)",
      type: "number",
      width: 120,
      valueFormatter: ({ value }) =>
        value != null ? value.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "",
    },
    {
      field: "created_at",
      headerName: "Bid Date",
      type: "dateTime",
      width: 180,
    },
    { field: "listing_id",   headerName: "Listing ID",  width: 100 },
    {
      field: "listing_name",
      headerName: "Listing Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "end_date",
      headerName: "Ends",
      type: "dateTime",
      width: 180,
    },
  ];

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* Toggle Buttons */}
        <div
          className="toggleButtons"
          style={{ display: "flex", gap: 8, marginBottom: 16 }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/myListings")}
            sx={{ borderRadius: "999px", textTransform: "none" }}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/myListingsBids")}
            sx={{ borderRadius: "999px", textTransform: "none" }}
          >
            Bids On My Listings
          </Button>
        </div>

        <h1 className="profileTitle">Bids on My Listings</h1>

        <div style={{ width: "100%" }}>
          <DataGrid
            autoHeight
            loading={loading}
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
