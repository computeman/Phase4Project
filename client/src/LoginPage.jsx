import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import SignUp from "./SignUp";
import "./Loginpage.css";
import "./Loginpage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUpForm, setShowSignUpForm] = useState(false);
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

  const toggleSignUpForm = () => {
    setShowSignUpForm((prev) => !prev);
  };

  return (
    <div className="center">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="txt_field">
          
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br /><label>Username </label>
        </div>
        <div className="txt_field">
        
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <label>Password </label>
        </div>
        <button className="button"onClick={handleLogin}>Login</button> <br />
      </form>
    </div>
  );
};

export default LoginPage;
