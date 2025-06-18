import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ListingCategoryPage = () => {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/categories/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
      else alert(data.message);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Search Categories</h2>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link to={`/admin/category/${cat.id}`}>{cat.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListingCategoryPage;
