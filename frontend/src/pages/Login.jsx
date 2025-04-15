import React, { useState } from "react";
import { NavLink } from "react-router-dom";



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


	{/* // Avg // */}
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

	{/* //-------------------TEST Login--------------------// */}
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
		  navigate("/dashboard");
		} catch (err) {
		  setLoginError(err.message);
		} finally {
		  setLoginLoading(false);
		}
	  };

	{/* //---------------------Test end--------------------// */}

	return (
		<div id="b1" style={{
			backgroundColor: '#efeed8'
		}}>

		<h1>
            Hello this is our website
			"You're a website" - Saud
        </h1>

		<div style={{ marginBottom: "10px" }}>
			<label>
          		A: <input type="number" value={numA} onChange={e => setNumA(e.target.value)} />
        	</label>
			<label style={{ marginLeft: "10px" }}>
          		B: <input type="number" value={numB} onChange={e => setNumB(e.target.value)} />
        	</label>
		</div>

		<button onClick={handleGetAverage} disabled={!numA || !numB}>
        	{loading ? "Calculating..." : "Get Average"}
     	</button>
		
		{average !== null && (
        	<p style={{ marginTop: "10px" }}>
          		📊 Average result: <strong>{average}</strong>
        	</p>
      	)}
		
		{/* //-------------------TEST Login--------------------// */}
		<h2 style={{ marginBottom: "15px", textAlign: "center" }}>
          User login
        </h2>
		<div style={{ marginBottom: "10px" }}>
			<label>
				Email:{" "}
            	<input
              	 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Please enter your email address"
                 style={{ width: "100%", marginTop: "4px" }}
            	/>
			</label>
		</div>

		<div style={{ marginBottom: "10px" }}>
			<label>
            	Password:{" "}
            	<input
              	 type="password"
              	 value={password}
              	 onChange={(e) => setPassword(e.target.value)}
              	 placeholder="Please enter your password"
              	 style={{ width: "100%", marginTop: "4px" }}
            	/>
          	</label>
		</div>

		<button
          onClick={handleLogin}
          disabled={loginLoading || !email || !password}
          style={{ width: "100%", padding: "8px" }}
        >
			{loginLoading ? "Logging in..." : "Log in"}
		</button>

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
