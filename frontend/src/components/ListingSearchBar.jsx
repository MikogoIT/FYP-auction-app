// src/components/ListingSearchBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ListingSearchBar({ initialSearch = "" }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState(initialSearch);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/listings?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
                className="searchInput"
                type="text"
                placeholder="🔍 Search by title or description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <md-filled-button
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
            >
                Search
            </md-filled-button>
        </div>
    );
}