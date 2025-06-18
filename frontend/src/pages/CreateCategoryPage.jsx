import React, { useState } from "react";

const CreateCategoryPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!name.trim() || !description.trim()) {
      return setMsg("❌ Name and description are required.");
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Category created.");
        setName("");
        setDescription("");
      } else {
        setMsg("❌ " + (data.message || "Creation failed"));
      }
    } catch (err) {
      setMsg("❌ Server error");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create New Category</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <button type="submit">Create</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
};

export default CreateCategoryPage;
