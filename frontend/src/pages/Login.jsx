import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import "@material/web/button/filled-button.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontFamily: "Roboto, sans-serif", fontWeight: 900 }}
      >
        Welcome Back
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 4 }}>
        <Stack spacing={2}>
          {["email", "password"].map((field) => (
            <TextField
              key={field}
              name={field}
              label={field === "email" ? "Email Address" : "Password"}
              type={field === "password" ? "password" : "email"}
              required
              fullWidth
              value={formData[field]}
              onChange={handleChange}
              InputProps={{
                style: {
                  fontFamily: "Roboto, sans-serif",
                  fontSize: 16,
                },
              }}
            />
          ))}

          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <Box sx={{ position: "relative", mt: 1 }}>
            <md-filled-button
              unelevated
              type="submit"
              style={{ width: "100%", fontFamily: "Roboto, sans-serif" }}
              disabled={loading}
            >
              Log In
            </md-filled-button>
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

          <Typography variant="body2" align="center">
            Don't have an account?{" "}
            <Link component={NavLink} to="/register" underline="none">
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
