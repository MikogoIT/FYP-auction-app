// src/pages/Notif.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

import formatDistanceToNow from "date-fns/formatDistanceToNow";

export default function Notif() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const CLICKABLE_PREFIXES = [
    "[outbid]",
    "[auction ending]",
    "[bid won]",
    "[review]"
  ];

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
      width: 160,
      renderCell: (params) =>
        formatDistanceToNow(new Date(params.value), { addSuffix: true }),
    },
  ];

  useEffect(() => {
    fetch("/api/notifications/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(({ notifications }) => {
        const data = notifications.map((n) => ({
          id:         n.id,
          message:    n.content,
          createdAt:  n.created_at,
          auctionId:  n.auction_id,
          sellerId:   n.seller_id,
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

            // Highlight rows that can be clicked
            getRowClassName={(params) => {
                const msg = params.row.message || "";
                return CLICKABLE_PREFIXES.some(prefix => msg.startsWith(prefix))
                  ? "clickable-row"
                  : "";
              }}

            // Apply pointer cursor only to clickable rows
            sx={{
              "& .clickable-row": {
                cursor: "pointer",
              },
            }}

           // Navigate based on message prefix
          onRowClick={(params) => {
            const { message, auctionId, sellerId } = params.row;

            if (message.startsWith("[outbid]") && auctionId) {
              // someone has out‑bid you → go to that auction page
              navigate(`/bid/${auctionId}`);

            } else if (message.startsWith("[auction ending]") && auctionId) {
              // auction is about to end → also go to the auction page
              navigate(`/bid/${auctionId}`);

            } else if (message.startsWith("[bid won]") && sellerId) {
              // you’ve won → go to the seller’s profile/feedback page
              navigate(`/feedback/${sellerId}`);

            } else if (message.startsWith("[review]") && auctionId) {
              // review prompt → sends auctionId to UserFeedbackPage.jsx
              navigate(`/feedback-user/${auctionId}`);
            }

          }}
          />
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
