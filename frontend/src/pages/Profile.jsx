import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

        setUser(data.user); // expected: { username, email, phone_number, address }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading profile...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👤 User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone Number:</strong> {user.phone_number}</p>
      <p><strong>Address:</strong> {user.address}</p>
    </div>
  );
};

export default Profile;
