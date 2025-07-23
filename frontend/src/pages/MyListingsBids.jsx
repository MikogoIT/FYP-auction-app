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

  // Map API fields into DataGrid rows, including buyer_name
  const rows = bids.map((b) => ({
    id:           b.bid_id,                            // unique row id
    bid_id:       b.bid_id,
    buyer_name:   b.buyer_name,                        // new field
    bid_amount:   parseFloat(b.bid_amount),
    created_at:   b.bid_created_at ? new Date(b.bid_created_at) : null,
    listing_name: b.listing_name,
    end_date:     b.listing_end_date ? new Date(b.listing_end_date) : null,
  }));

  const columns = [
    { field: "bid_id",       headerName: "Bid ID",         width: 100 },
    { field: "buyer_name",   headerName: "Buyer Name",     width: 180, flex: 1 },
    {
      field: "bid_amount",
      headerName: "Amount",
      type: "number",
      width: 120,
      valueFormatter: ({ value }) =>
        value != null
          ? value.toLocaleString(undefined, { style: "currency", currency: "USD" })
          : "",
    },
    {
      field: "created_at",
      headerName: "Bid Date",
      type: "dateTime",
      width: 180,
    },
    {
      field: "listing_name",
      headerName: "Listing Name",
      width: 200,
      flex: 1,
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
            sx={{ borderRadius: "999px", textTransform: "none" , fontSize: "16px",}}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/myListingsBids")}
            sx={{ borderRadius: "999px", textTransform: "none", fontSize: "16px", }}
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
            sx={{
              fontSize: "16px",
              // header
              "& .MuiDataGrid-columnHeader": {
                fontSize: "16px",
              },
              // cells
              "& .MuiDataGrid-cell": {
                fontSize: "16px",
              },
              // pagination, footer, etc
              "& .MuiDataGrid-footerContainer": {
                fontSize: "16px",
              },
            }}
          />
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
