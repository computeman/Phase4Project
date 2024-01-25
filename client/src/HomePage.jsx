// HomePage.js

import React from "react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const HomePage = () => {
  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <nav>
        <ul>
          <li>
            <Link to="/products">Products</Link>
          </li>
          <li>
            <Link to="/orders">Orders</Link>
          </li>
        </ul>
      </nav>
      <LogoutButton />
    </div>
  );
};

export default HomePage;
