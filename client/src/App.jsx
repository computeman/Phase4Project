import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import SignUp from "./SignUp";
import ProductsPage from "./ProductsPage";
import OrdersPage from "./OrdersPage";
import OrderFormPage from "./OrderFormPage";
import EditProductPage from "./EditProductPage";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import UserMetrics from "./UserMetrics";
import ProductForm from "./ProductForm";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = async (username, password) => {
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
        localStorage.setUserId(data.user_id);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  const PrivateRoute = ({ element }) => {
    const accessToken = localStorage.getItem("access_token");

    return accessToken ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <header>
        <h2 className="logo">Shopify 254</h2>
        <nav className="navigation">
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout}>Logout</button>
              <Link to={`/user-metrics/${userId}`}>User Metrics</Link>
              {/* Link to create a new product */}
              <Link to="/product-form">Create Product</Link>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
          <Link to="/signup">Sign Up</Link>
          <Link to="/products">Products</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/order-form">Order Form</Link>
          <Link to={"/user-metrics/:userId"}>Metrics</Link>
          <Link to="/product-form">Product Form</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/products"
          element={<PrivateRoute element={<ProductsPage />} />}
        />
        <Route
          path="/orders"
          element={<PrivateRoute element={<OrdersPage />} />}
        />
        <Route
          path="/order-form"
          element={<PrivateRoute element={<OrderFormPage />} />}
        />
        <Route
          path="/edit-product/:productId"
          element={<PrivateRoute element={<EditProductPage />} />}
        />
        <Route
          path="/user-metrics/:userId"
          element={<PrivateRoute element={<UserMetrics userId={userId} />} />}
        />
        <Route
          path="/product-form"
          element={<PrivateRoute element={<ProductForm user_id={userId} />} />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute element={<HomePage isLoggedIn={isLoggedIn} />} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
