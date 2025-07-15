// src/pages/TagPage.jsx

import TagAutocomplete from "../components/TagAutocomplete";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TagSellItem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minBid, setMinBid] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  /*
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]); // [{ name: "Shoes", locked: true }, { name: "leather", locked: false }]
  */

  // New Code
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tags, setTags] = useState([]); // [{ name: "Shoes", locked: true }, { name: "leather", locked: false }]
  const [tagOptions, setTagOptions] = useState([
    "leather",
    "running",
    "casual",
    "formal",
    "vintage",
    "limited edition",
  ]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Failed to load categories:", err));

    /* Not used yet
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTagOptions(data.tags.map((t) => t.name)))
      .catch(console.error);
    */
  }, []);

  /* Old Code const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find(
      (cat) => cat.id === parseInt(selectedId),
    );

    setCategoryId(selectedId);

    if (!selectedCategory) return;

    // Replace locked tag with category name
    setTags((prevTags) => {
      const unlockedTags = prevTags.filter((tag) => !tag.locked);
      const newLockedTag = { name: selectedCategory.name, locked: true };
      return [newLockedTag, ...unlockedTags];
    });
  };
  */

  // New Code
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((c) => c.id == selectedId);
    setCategoryId(selectedId);
    setCategoryName(selectedCategory?.name || "");
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!title || !minBid || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (parseFloat(minBid) <= 0) {
      setError("❌ Minimum bid must be greater than 0.");
      return;
    }

    if (new Date(endDate) < new Date()) {
      setError("❌ End date must be in the future.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          min_bid: parseFloat(minBid),
          end_date: endDate,
          category_id: categoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");

      setSuccess("Item listed successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("" + err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        ← Back
      </button>
      <h2 style={{ textAlign: "center" }}>Sell an Item</h2>

      <form onSubmit={handleSubmit}>
        <label>Category *</label>
        <select
          value={categoryId}
          onChange={handleCategoryChange} // <-- Use the handler
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        >
          <option value="">-- Select a category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Old Code
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        >
          <option value="">-- Select a category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        */}

        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        {/*<label>Tags</label> 
        <TagAutocomplete
          options={tagOptions}
          lockedTag={categoryName}
          onChange={(selectedTags) => setTags(selectedTags)}
        />*/}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <TagAutocomplete
            value={tags}
            onChange={setTags}
            options={tagOptions}
            lockedTag={categoryName}
          />
        </div>

        {/* Old Code
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          {tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: "6px 10px",
                background: "#e0e0e0",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              #{tag.name}
              {!tag.locked && (
                <button
                  onClick={() => removeTag(idx)}
                  style={{
                    marginLeft: "6px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>
        */}

        <label>Minimum Bid (SGD) *</label>
        <input
          type="number"
          step="0.01"
          value={minBid}
          onChange={(e) => setMinBid(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>End Date & Time *</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          List Item
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
        )}
      </form>
    </div>
  );
};

export default TagSellItem;
