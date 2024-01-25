import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    // Perform logout logic (e.g., clear local storage, make API request, etc.)
    // For example, clearing a token from localStorage
    localStorage.removeItem("access_token");

    // You might want to redirect to the login page or perform other actions
    // depending on your application's requirements

    // For this example, let's just reload the page
    window.location.reload();
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
