import React, { useState } from "react";
import { NavLink } from "react-router-dom";



const Login = () => {
	const [numA, setNumA] = useState("");
	const [numB, setNumB] = useState("");
	const [average, setAverage] = useState(null);
	const [loading, setLoading] = useState(false);

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
		
		</div>
	);
};

export default Login;
