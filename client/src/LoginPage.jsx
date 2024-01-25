import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUp from "./SignUp";

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
    <div>
      <h2>Login</h2>
      <label>Username: </label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <label>Password: </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
      <br />
      <button onClick={toggleSignUpForm}>Sign Up</button>

      {showSignUpForm && <SignUp />}
    </div>
  );
};

export default LoginPage;
