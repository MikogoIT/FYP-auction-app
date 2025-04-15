import React, { useState } from "react";
import { NavLink } from "react-router-dom";



const Login = () => {
	const [average, setAverage] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleGetAverage = async () => {
		setLoading(true);
		try {
		  const response = await fetch("/api/average");
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

		<h2>
			<text>This is a TEST - react  RAYDON</text>
		</h2>

		<h3>
			<text>TEST TEST - Shilong</text>
		</h3>

		<h4>
			<span>TT EE SS TT - Shilong</span>
		</h4>
		
		<h5>
			<text>TEST12312312- Qingyuan</text>
		</h5>
			
		
		</div>
	);
};

export default Login;
