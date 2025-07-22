// src/components/ListingGrid.jsx
import { useState } from "react";
import { Box, Pagination } from "@mui/material";
import ListingCard from "./ListingCard";

export default function ListingGrid({
  listings,
  itemsPerPage = 6,
  currentUserId,
  likedMap,
  onToggleLike,
  onBidClick,
  onEditClick,
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const paginated = listings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <div className="listingGrid">
        {paginated.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            isLiked={!!likedMap[item.id]}
            onToggleLike={onToggleLike}
            onBidClick={onBidClick}
            onEditClick={onEditClick}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </>
  );
}
