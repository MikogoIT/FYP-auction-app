import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryDetailPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategory(data.category);
        setName(data.category.name);
        setDescription(data.category.description);
      });
  }, [id]);

  const handleEdit = async () => {
    setMsg("");

    if (!name.trim()) {
        setMsg("❌ Name is required");
        return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (res.ok) {
        setMsg("✅ Updated successfully");
        setCategory(prev => ({ ...prev, name, description }));
    } 
    else setMsg("❌ " + data.message);
  };

  const toggleIs_suspended = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/categories/${id}/is_suspended`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
        setCategory((prev) => ({ ...prev, is_Suspended: data.is_Suspended }));
    } else {
        alert(data.message);
    }
  };

  if (!category) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Category Detail</h2>
      <p><strong>is_suspended:</strong> {category.is_suspended}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleEdit}>Edit</button>
        <button onClick={toggleIs_suspended}>
          {category.is_Suspended ? "Unsuspend" : "Suspend"}
        </button>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
