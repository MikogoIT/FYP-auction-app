import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCategoryPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!name.trim() || !description.trim()) {
      return setMsg("❌ Name and description are required.");
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Category created.");
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      } else {
        setMsg("❌ " + (data.message || "Creation failed"));
      }
    } catch (err) {
      setMsg("❌ Server error");
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button> {/* ← back button */}
      <h2 style={styles.title}>Create New Category</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          type="text"
          maxLength={50}
        />
        <textarea
          style={{ ...styles.input, height: 120, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          maxLength={300}
        />
        <button type="submit" style={styles.button}>
          Create
        </button>
        {msg && (
          <p
            style={{
              marginTop: 12,
              color: msg.startsWith("✅") ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 500,
    margin: "40px auto",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    background: "#f0f0f0",
    border: "1px solid #ccc",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
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
  button: {
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
};

export default CreateCategoryPage;
