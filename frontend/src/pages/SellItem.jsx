// src/components/Sellitem.jsx

import TagAutocomplete from "../components/TagAutocomplete";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SellItem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minBid, setMinBid] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auctionType, setAuctionType] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState();
  const tagNames = tags.map((tag) =>
    typeof tag === "string" ? tag : tag.name,
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Failed to load categories:", err));

    fetch("/api/tag")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.tags)) {
          setTagOptions(data.tags); // ✅ Flat string array
        }
      })
      .catch((err) => console.error("Failed to load tag options:", err));
  }, []);

  // Resetting Tags with Change of New Category
  useEffect(() => {
    if (categoryName && !tags.includes(categoryName)) {
      setTags([categoryName]);
      //console.log("Category changed →", categoryName);
    }
  }, [categoryName]);

  // Console Log Tag (Debug)
  useEffect(() => {
    if (tags.length) {
      //console.log("🔁 Tags Updated →", tags);
    }
  }, [tags]);

  // Console Log Auction Type(Debug)
  useEffect(() => {
    console.log("🛠 Auction Type Selected:", auctionType);

    if (auctionType === "ascending") {
      console.log("💰 Minimum Bid:", minBid);
    }

    if (auctionType === "descending") {
      console.log("🔽 Start Price:", startPrice);
      console.log("📉 Discount %:", discountPercentage);
    }
  }, [auctionType, minBid, startPrice, discountPercentage]);

  // Clear Inputs on switching Auction Type
  useEffect(() => {
    if (auctionType === "descending") {
      setDiscountPercentage(10); // default 10%
      setStartPrice(""); // clear start price to be safe
      setMinBid(""); // clear min bid if needed
    } else if (auctionType === "ascending") {
      setMinBid("");
      setStartPrice(null);
      setDiscountPercentage(10);
    }
  }, [auctionType]);

  // Category Change
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((c) => c.id == selectedId);
    setCategoryId(selectedId);
    setCategoryName(selectedCategory?.name || "");
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent further execution if already submitting
    setSubmitting(true); // Sets to true right away
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!title || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    if (auctionType === "ascending" && !minBid) {
      setError("Please enter a minimum bid.");
      return;
    }

    if (auctionType === "descending" && (!startPrice || !discountPercentage)) {
      setError("Please enter both start price and discount percentage.");
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

    // Debug Log for Tags Submission
    //console.log("Tags being inserted:", tags);

    try {
      // 1. Create the listing first
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          end_date: endDate,
          auction_type: auctionType,
          category_id: categoryId,
          ...(auctionType === "ascending" && {
            min_bid: parseFloat(minBid),
            start_price: null,
            discount_percentage: 10,
          }),
          ...(auctionType === "descending" && {
            min_bid: null,
            start_price: startPrice ? parseFloat(startPrice) : null,
            discount_percentage:
              parseFloat(discountPercentage) >= 10
                ? parseFloat(discountPercentage)
                : 10,
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");

      // 2. Now insert tags via /api/tag
      const tagRes = await fetch("/api/tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          auction_id: data.listing.id, // ✅ use ID from first request
          tags: tagNames,
        }),
      });

      const tagData = await tagRes.json();
      if (!tagRes.ok)
        throw new Error(tagData.message || "Failed to insert tags");

      // 3. Success
      setSuccess("Item listed successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("" + err.message);
    } finally {
      setSubmitting(false); // Allow future submissions if the user stays
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
        {/* Category */}
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

        {/* Title */}
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        {/* Description */}
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        {/* Tag */}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <TagAutocomplete
            options={tagOptions}
            value={tags}
            onChange={setTags}
            lockedTag={categoryName}
          />
        </div>

        {/* Ascending/Descending Type  */}
        <label>Auction Type *</label>
        <select
          value={auctionType}
          onChange={(e) => setAuctionType(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        >
          <option value="">-- Select Auction Type --</option>
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>

        {auctionType === "ascending" && (
          <>
            <label>Minimum Bid (SGD) *</label>
            <input
              type="number"
              step="0.01"
              value={minBid}
              onChange={(e) => setMinBid(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
            />
          </>
        )}

        {auctionType === "descending" && (
          <>
            <label>Start Price (SGD) *</label>
            <input
              type="number"
              step="0.01"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
            />

            <label>Discount Percentage (%) *</label>
            <input
              type="number"
              step="0.1"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
            />
          </>
        )}

        {/* Bid End Date & Time */}
        <label>End Date & Time *</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Listing..." : "List Item"}
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
        )}
      </form>
    </div>
  );
};

export default SellItem;
