// src/pages/Notif.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { DataGrid } from "@mui/x-data-grid";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

export default function Notif() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // define your columns based on the notifications table
  const columns = [
    {
      field: "message",
      headerName: "Message",
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
    },
    {
      field: "action",
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleMarkRead(params.row.id)}
        >
          <CheckIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    fetch("/api/notifications", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(({ notifications }) => {
        // map each notification into a DataGrid row
        const data = notifications.map((n) => ({
          id: n.id,
          message: n.content,
          createdAt: new Date(n.created_at).toLocaleString(),
        }));
        setRows(data);
      })
      .catch((err) => {
        console.error(err);
        // you could show an error snackbar here
      })
      .finally(() => setLoading(false));
  }, []);

  // example action to mark a notification as read
  const handleMarkRead = async (notifId) => {
    await fetch(`/api/notifications/${notifId}/read`, {
      method: "POST",
      credentials: "include",
    });
    // remove from list
    setRows((prev) => prev.filter((r) => r.id !== notifId));
  };

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />
        <div id="wideTitle" className="profileTitle">
          Notifications
        </div>

        <div style={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSize={10}
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
