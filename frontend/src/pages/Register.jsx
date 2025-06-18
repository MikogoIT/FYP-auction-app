import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccessMsg("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", backgroundColor: "#f3f3f3", borderRadius: "8px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        ← Back
      </button>
      <h2 style={{ textAlign: "center" }}>User Registration</h2>

      <form onSubmit={handleSubmit}>
        {["username", "email", "password", "full_name", "phone_number", "address"].map((field) => (
          <div key={field} style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", textTransform: "capitalize" }}>
              {field.replace("_", " ")}:
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
              placeholder={`Enter your ${field.replace("_", " ")}`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {errorMsg && <p style={{ color: "red", marginTop: "10px" }}>❌ {errorMsg}</p>}
      {successMsg && <p style={{ color: "green", marginTop: "10px" }}>{successMsg}</p>}
    </div>
  );
};

export default Register;
