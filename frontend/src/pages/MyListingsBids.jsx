// src/pages/MyListingsBids.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";

// Material Web buttons are no longer needed here

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
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setBids(data.bids);
      } catch (err) {
        console.error("Failed to fetch bids on listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    { field: 'bid_id', headerName: 'Bid ID', width: 100 },
    { field: 'buyer_id', headerName: 'Buyer ID', width: 100 },
    {
      field: 'bid_amount',
      headerName: 'Amount',
      width: 120,
      valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: 'created_at',
      headerName: 'Bid Date',
      width: 180,
      valueGetter: ({ row }) => new Date(row.created_at).toLocaleString(),
    },
    { field: 'listing_id', headerName: 'Listing ID', width: 100 },
    { field: 'listing_name', headerName: 'Listing Name', width: 200, flex: 1 },
    {
      field: 'end_date',
      headerName: 'Ends',
      width: 180,
      valueGetter: ({ row }) => new Date(row.end_date).toLocaleString(),
    },
  ];

  // DataGrid expects each row to have a unique 'id' property
  const rows = bids.map((b) => ({ id: b.bid_id, ...b }));

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* Toggle Buttons */}
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
              '&:hover': { borderColor: 'grey.600' },
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
              '&:hover': { borderColor: 'primary.dark' },
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
        <div style={{ height: 500, width: '100%' }}>
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
