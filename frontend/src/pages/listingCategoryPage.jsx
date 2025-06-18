import React, { useState } from "react";
import { Link } from "react-router-dom";

const ListingCategoryPage = () => {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState("");

  const handleSearch = async () => {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!query.trim()) {
      setMsg("Please enter a search term.");
      return;
    }

    try {
      const res = await fetch(`/api/categories/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
        if (!data.categories || data.categories.length === 0) {
          setMsg("No categories found.");
        }
      } else {
        setMsg(data.message || "Search failed");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setMsg("Server error during search");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Search Categories</h2>
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>
      {msg && <p style={styles.msg}>{msg}</p>}
      <ul style={styles.list}>
        {categories.map((cat) => (
          <li key={cat.id} style={styles.listItem}>
            <Link to={`/admin/category/${cat.id}`} style={styles.link}>
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  searchBox: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flexGrow: 1,
    padding: "12px 16px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.8px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: "12px 24px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  msg: {
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
    maxHeight: 300,
    overflowY: "auto",
    borderTop: "1px solid #eee",
  },
  listItem: {
    padding: "12px 10px",
    borderBottom: "1px solid #eee",
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: "500",
  },
};

export default ListingCategoryPage;
