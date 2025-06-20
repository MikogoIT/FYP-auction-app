import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CategoryDetailPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/categories/${id}`, {
      credentials: "include", 
    })
      .then(async (res) => {
        const data = await res.json();
        console.log("Response data:", data, "Status:", res.status);
        if (!res.ok) throw new Error(data.message || "Failed to fetch");
        return data;
      })
      .then((data) => {
        setCategory(data.category);
        setName(data.category.name);
        setDescription(data.category.description);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setMsg("❌ " + err.message);
        setCategory(null);
      });
  }, [id]);

  const handleEdit = async () => {
    setMsg("");
    if (!name.trim()) {
      setMsg("❌ Name is required");
      return;
    }
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("✅ Updated successfully");
      setCategory((prev) => ({ ...prev, name, description }));
    } else {
      setMsg("❌ " + data.message);
    }
  };

  const toggleIsSuspended = async () => {
    const res = await fetch(`/api/categories/${id}/toggleSuspend`, {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setCategory((prev) => ({ ...prev, is_suspended: data.newState }));
    } else {
      alert(data.message);
    }
  };

  if (!category) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>
      <h2 style={styles.title}>Category Detail</h2>
      <p style={styles.status}>
        <strong>Status:</strong>{" "}
        <span style={{ color: category.is_suspended ? "red" : "green" }}>
          {category.is_suspended ? "Suspended" : "Active"}
        </span>
      </p>
      <div style={styles.form}>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          maxLength={50}
        />
        <textarea
          style={{ ...styles.input, height: 120, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          maxLength={300}
        />
        <button style={styles.editBtn} onClick={handleEdit}>
          Save Changes
        </button>
        <button
          style={{
            ...styles.suspendBtn,
            backgroundColor: category.is_suspended ? "#28a745" : "#dc3545",
          }}
          onClick={toggleIsSuspended}
        >
          {category.is_suspended ? "Unsuspend" : "Suspend"}
        </button>
        {msg && (
          <p
            style={{
              marginTop: 12,
              color: msg.startsWith("✅") ? "green" : "red",
              fontWeight: "600",
            }}
          >
            {msg}
          </p>
        )}
      </div>
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
  status: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: "12px 16px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.8px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  editBtn: {
    padding: "12px",
    fontSize: 18,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  suspendBtn: {
    padding: "12px",
    fontSize: 18,
    borderRadius: 8,
    border: "none",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#666",
  },
};

export default CategoryDetailPage;
