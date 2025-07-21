// src/pages/Notif.jsx

import { useState, useEffect } from "react";

import { DataGrid } from "@mui/x-data-grid";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

import formatDistanceToNow from "date-fns/formatDistanceToNow";

export default function Notif() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // columns: message + relative time
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
      headerName: "When",
      width: 160,
      renderCell: (params) =>
        formatDistanceToNow(new Date(params.value), { addSuffix: true }),
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
        const data = notifications.map((n) => ({
          id: n.id,
          message: n.content,
          createdAt: n.created_at, // keep raw timestamp
        }));
        setRows(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

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
