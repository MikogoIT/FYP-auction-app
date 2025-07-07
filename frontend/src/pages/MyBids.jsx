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
        const res = await fetch('/api/MyBids', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch bids');
        const { bids: fetchedBids } = await res.json();
        setBids(fetchedBids);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const columns = [
    { field: 'bid_id', headerName: 'Bid ID', type: 'number', width: 100 },
    { field: 'listing_name', headerName: 'Listing', flex: 1, minWidth: 150 },
    {
      field: 'bid_amount',
      headerName: 'Bid Amount',
      type: 'number',
      valueFormatter: ({ value }) =>
        typeof value === 'number' ? value.toLocaleString() : value,
      width: 130,
    },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'created_at',
      headerName: 'Placed On',
      type: 'dateTime',
      valueGetter: ({ row }) => new Date(row.created_at),
      width: 180,
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      type: 'dateTime',
      valueGetter: ({ row }) => new Date(row.updated_at),
      width: 180,
    },
    {
      field: 'end_date',
      headerName: 'Ends On',
      type: 'dateTime',
      valueGetter: ({ row }) => new Date(row.end_date),
      width: 180,
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
            rows={bids}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            getRowId={(row) => row.bid_id}
          />
        )}
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
