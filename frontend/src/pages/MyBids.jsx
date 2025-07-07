// src/pages/MyBids.jsx

import { Crud } from '@toolpad/core';
// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';

const bidsDataSource = {
  fields: [
    { field: 'bid_id', headerName: 'Bid ID', type: 'number' },
    { field: 'listing_name', headerName: 'Listing', flex: 1 },
    { field: 'bid_amount', headerName: 'Bid Amount', type: 'number' },
    { field: 'status', headerName: 'Status' },
    {
      field: 'created_at',
      headerName: 'Placed On',
      type: 'dateTime',
      valueGetter: ({ value }) => value && new Date(value),
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      type: 'dateTime',
      valueGetter: ({ value }) => value && new Date(value),
    },
    {
      field: 'end_date',
      headerName: 'Ends On',
      type: 'dateTime',
      valueGetter: ({ value }) => value && new Date(value),
    },
  ],
  getMany: async ({ paginationModel }) => {
    const params = new URLSearchParams();
    params.append('page', paginationModel.page.toString());
    params.append('pageSize', paginationModel.pageSize.toString());

    const res = await fetch(`/api/MyBids?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch bids');
    const data = await res.json();

    return {
      items: data.bids,
      itemCount: data.bids.length,
    };
  },
};

export default function MyBids() {
  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div className="profileTitle">My Bids</div>
        <Crud
          dataSource={bidsDataSource}
          rootPath="/my-bids"
          initialPageSize={10}
        />
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
