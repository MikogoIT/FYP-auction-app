// src/pages/MyBids.jsx

import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import BreadcrumbsNav from "../components/BreadcrumbsNav";


export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

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

  const openConfirm = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmId(null);
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/bids/${confirmId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchBids();
    } catch (err) {
      console.error(err);
    } finally {
      closeConfirm();
    }
  };

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
    { field: 'bid_amount', headerName: 'Bid Amount ($)', type: 'number', width: 130 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created_at', headerName: 'Placed On', type: 'dateTime', width: 180 },
    { field: 'updated_at', headerName: 'Last Updated', type: 'dateTime', width: 180 },
    { field: 'end_date', headerName: 'Ends On', type: 'dateTime', width: 180 },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      cellClassName: 'actionsColumn',
      headerClassName: 'actionsHeader',
      renderCell: (params) => (
        <IconButton
          aria-label="delete"
          size="small"
          sx={{ color: 'text.secondary' }}
          onClick={() => openConfirm(params.id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
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
        <BreadcrumbsNav />
        <div id="wideTitle" className="profileTitle">My Bids </div>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{
                '& .actionsColumn': {
                  position: 'sticky',
                  right: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                },
                '& .actionsHeader': {
                  position: 'sticky',
                  right: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                },
              }}
            />
          </Box>
        )}

        <Dialog
          open={confirmOpen}
          onClose={closeConfirm}
          PaperProps={{ sx: { borderRadius: '24px' } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="warning" />
            Withdraw this bid?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently withdraw your bid. A 5% fee will be incurred!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirm} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" sx={{ textTransform: 'none' }}>
              Withdraw
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
