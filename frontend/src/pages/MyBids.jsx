// src/pages/MyBids.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContext, setConfirmContext] = useState({ type: '', ids: [] });

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bids/MyBids', { credentials: 'include' });
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const { bids: data } = await res.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  // Open confirmation for single or bulk deletion
  const openConfirm = (type, ids) => {
    setConfirmContext({ type, ids });
    setConfirmOpen(true);
  };
  const closeConfirm = () => setConfirmOpen(false);

  const performDelete = async () => {
    const { type, ids } = confirmContext;
    try {
      if (type === 'bulk') {
        await Promise.all(
          ids.map((id) =>
            fetch(`/api/bids/${id}`, { method: 'DELETE', credentials: 'include' })
          )
        );
        setSelectionModel([]);
      } else if (type === 'single') {
        await fetch(`/api/bids/${ids[0]}`, { method: 'DELETE', credentials: 'include' });
      }
      await fetchBids();
    } catch (err) {
      console.error(err);
    } finally {
      closeConfirm();
    }
  };

  // Prepare rows for DataGrid
  const rows = bids.map((bid) => ({
    id: bid.bid_id,
    listing_name: bid.listing_name,
    bid_amount: parseFloat(bid.bid_amount),
    status: bid.status,
    created_at: bid.created_at ? new Date(bid.created_at) : null,
    updated_at: bid.updated_at ? new Date(bid.updated_at) : null,
    end_date: bid.end_date ? new Date(bid.end_date) : null,
  }));

  const columns = [
    { field: 'id', headerName: 'Bid ID', width: 100 },
    { field: 'listing_name', headerName: 'Listing', flex: 1, minWidth: 150 },
    { field: 'bid_amount', headerName: 'Bid Amount', type: 'number', width: 130 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created_at', headerName: 'Placed On', type: 'dateTime', width: 180 },
    { field: 'updated_at', headerName: 'Last Updated', type: 'dateTime', width: 180 },
    { field: 'end_date', headerName: 'Ends On', type: 'dateTime', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => openConfirm('single', [params.id])}
        >
          Delete
        </Button>
      ),
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
    <Box className="dashboardCanvas" sx={{ display: 'flex' }}>
      <Box className="sidebarSpacer" />
      <Box className="dashboardContent" sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom>
          My Bids
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={{ mb: 1 }}>
              <Button
                variant="contained"
                color="error"
                disabled={!selectionModel.length}
                onClick={() => openConfirm('bulk', selectionModel)}
              >
                Delete Selected ({selectionModel.length})
              </Button>
            </Box>

            <Box sx={{ width: '100%' }}>
              <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                selectionModel={selectionModel}
                onSelectionModelChange={(newSel) => setSelectionModel(newSel)}
              />
            </Box>
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={closeConfirm}>
          <DialogTitle>
            {confirmContext.type === 'bulk'
              ? `Delete ${confirmContext.ids.length} bids?`
              : 'Delete this bid?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmContext.type === 'bulk'
                ? 'This will permanently withdraw all selected bids. A fee of 5% will be incurred!'
                : 'This will permanently withdraw the selected bid. A fee of 5% will be incurred!'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirm}>Cancel</Button>
            <Button onClick={performDelete} color="error">
              Confirm Withdrawal
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
