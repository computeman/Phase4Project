import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Loginpage.css';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        // Navigate to the products page or any other authenticated route
        navigate("/products");
      } else {
        // Handle invalid credentials or other errors
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return ( 
  <div className="center">
  <h1>Login</h1>
  <form method="post" onSubmit={handleLogin}>
    <div className="txt_field">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
     
      <label>Username</label>
    </div>
    <div className="txt_field">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <span></span>
      <label>Password</label>
    </div>
   
    <input type="submit" value="Login" />
    
   
  </form>
</div>
);
};

export default LoginPage;