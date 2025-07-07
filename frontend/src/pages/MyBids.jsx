// src/pages/MyBids.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Map each bid to a row with an 'id' property for DataGrid
  const rows = bids.map((bid) => ({ id: bid.bid_id, ...bid }));

  const columns = [
    { field: 'id', headerName: 'Bid ID', type: 'number', width: 100 },
    { field: 'listing_name', headerName: 'Listing', flex: 1, minWidth: 150 },
    {
      field: 'bid_amount',
      headerName: 'Bid Amount',
      type: 'number',
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
      width: 130,
    },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'created_at',
      headerName: 'Placed On',
      width: 180,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      width: 180,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
    {
      field: 'end_date',
      headerName: 'Ends On',
      width: 180,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
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
        <Typography variant="h5" gutterBottom>
          My Bids
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
