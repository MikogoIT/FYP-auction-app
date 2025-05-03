import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";


const Login = () => {
	const [numA, setNumA] = useState("");
	const [numB, setNumB] = useState("");
	const [average, setAverage] = useState(null);
	const [loading, setLoading] = useState(false);


	const [email, setEmail] = useState("");
  	const [password, setPassword] = useState("");
  	const [loginLoading, setLoginLoading] = useState(false);
  	const [loginError, setLoginError] = useState("");

	const navigate = useNavigate();


	// Avg
	const handleGetAverage = async () => {
		setLoading(true);
		setAverage(null);
	
		try {
		  const response = await fetch(`/api/average?a=${numA}&b=${numB}`);
		  const data = await response.json();
		  setAverage(data.average);
		} catch (error) {
		  console.error("Error fetching average:", error);
		  setAverage("Error");
		} finally {
		  setLoading(false);
		}
	  };

	//-------------------TEST Login------------
	const handleLogin = async () => {
		setLoginLoading(true);
		setLoginError("");
		try {
		  const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		  });
		  const data = await res.json();
		  if (!res.ok) {
			throw new Error(data.message || "Login Failed");
		  }
		  // Save token and redirect
		  localStorage.setItem("token", data.token);
		  localStorage.setItem("userId", data.user.id);
		  navigate("/dashboard");
		} catch (err) {
		  setLoginError(err.message);
		} finally {
		  setLoginLoading(false);
		}
	  };

	//------------------Test end--------

	return (
		<div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", backgroundColor: "#f3f3f3", borderRadius: "8px" }}>
		
		{/* //-------------------TEST Login--------------------// */}
		<h2 style={{ textAlign: "center", marginBottom: "20px" }}>User Login</h2>

		<form onSubmit={ (e) => { e.preventDefault(); handleLogin(); } }>
			{/*Email*/}
			<div style={{ marginBottom: "12px" }}>
				<label style={{ display: "block", marginBottom: "4px" }}>Email:</label>
				<input
              	 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Please enter your email address"
                 style={{ width: "100%", marginTop: "4px" }}
            	/>
			</div>
			{/*Password*/}
			<div style={{ marginBottom: "12px" }}>
				<label style={{ display: "block", marginBottom: "4px" }}>Password:</label>
				<input
              	 type="password"
              	 value={password}
              	 onChange={(e) => setPassword(e.target.value)}
              	 placeholder="Please enter your password"
              	 style={{ width: "100%", marginTop: "4px" }}
            	/>
			</div>
			{/*Submit button */}
			<button
    			type="submit"
    			disabled={loginLoading || !email || !password}
    			style={{
      				width: "100%",
      				padding: "10px",
      				backgroundColor: "#4CAF50",
      				color: "white",
      				border: "none",
      				cursor: loginLoading ? "not-allowed" : "pointer"
    			}}
  			>
				{loginLoading ? "Logging in..." : "Log in"}
			</button>
		</form>

		{loginError && (
          <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
            ❌ {loginError}
          </p>
        )}
		<p style={{ marginTop: "15px", textAlign: "center" }}>
		No account yet?<NavLink to="/register">Go to register</NavLink>
        </p>

		{/* //---------------------Test end--------------------// */}
		</div>
	);
};

export default Login;
