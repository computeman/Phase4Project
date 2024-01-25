// LogoutButton.js

import React from "react";
import { useAuth } from "./AuthContext";

const LogoutButton = () => {
  const { dispatch } = useAuth();

  const handleLogout = () => {
    // Perform logout logic (e.g., clear local storage, make API request, etc.)
    // After logout, update the state using dispatch
    dispatch({ type: "LOGOUT" });
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
