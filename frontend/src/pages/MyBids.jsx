// src/pages/MyBids.jsx

import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch('/api/bids/MyBids', { credentials: 'include' });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        console.log('Fetched bids:', data.bids);
        setBids(Array.isArray(data.bids) ? data.bids : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  // Convert API strings to proper types for DataGrid
  const rows = bids.map((bid) => ({
    id: bid.bid_id,
    listing_name: bid.listing_name,
    bid_amount:
      typeof bid.bid_amount === 'string' ? parseFloat(bid.bid_amount) : bid.bid_amount,
    status: bid.status,
    created_at: bid.created_at ? new Date(bid.created_at) : null,
    updated_at: bid.updated_at ? new Date(bid.updated_at) : null,
    end_date: bid.end_date ? new Date(bid.end_date) : null,
  }));

  const columns = [
    { field: 'id', headerName: 'Bid ID', type: 'number', width: 100 },
    { field: 'listing_name', headerName: 'Listing', flex: 1, minWidth: 150 },
    { field: 'bid_amount', headerName: 'Bid Amount', type: 'number', width: 130 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created_at', headerName: 'Placed On', type: 'dateTime', width: 180 },
    { field: 'updated_at', headerName: 'Last Updated', type: 'dateTime', width: 180 },
    { field: 'end_date', headerName: 'Ends On', type: 'dateTime', width: 180 },
  ];

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboardCanvas">
      <Box className="sidebarSpacer" />
      <Box className="dashboardContent">
        
          {/* page title */}
          <div className="profileTitle">My Bids</div>
        
        {loading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ width: '100%' }} 
          />
        )}
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
