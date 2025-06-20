import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, TextField, Stack, Alert, CircularProgress } from "@mui/material";
import { Button } from "@material/web/button";
import "@material/web/button/dist/md-button.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "", email: "", password: "",
    full_name: "", phone_number: "", address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccessMsg("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        unelevated
        style={{ borderRadius: 24, marginBottom: 16, padding: "8px 16px" }}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontFamily: "Roboto, sans-serif", fontWeight: 900 }}
        >
          Create your account
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 4 }}
        >
          <Stack spacing={2}>
            {["username", "email", "password", "full_name", "phone_number", "address"].map((field) => (
              <TextField
                key={field}
                name={field}
                label={field
                  .replace("_", " ")
                  .replace(/\b\w/g, c => c.toUpperCase())}
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                multiline={field === "address"}
                rows={field === "address" ? 2 : undefined}
                value={formData[field]}
                onChange={handleChange}
                required={["username","email","password"].includes(field)}
                fullWidth
                InputProps={{ style: { fontFamily: "Roboto, sans-serif", fontSize: 16 } }}
              />
            ))}

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            {successMsg && <Alert severity="success">{successMsg}</Alert>}

            <Box sx={{ position: "relative" }}>
              <Button
                unelevated
                type="submit"
                style={{ borderRadius: 24, width: "100%", padding: "12px 0" }}
                disabled={loading}
              >
                Register
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Container>
    </div>
  );
}
