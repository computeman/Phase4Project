import React, { useEffect, useState } from "react";
import './orderpage.css'

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch orders from the API with JWT token
    const token = localStorage.getItem("access_token");

    fetch("http://127.0.0.1:5000/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized access, handle accordingly (e.g., redirect to login)
            setError("Unauthorized access. Please log in.");
          } else {
            throw new Error("Error fetching orders");
          }
        }
        return response.json();
      })
      .then((data) => setOrders(data))
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders. Please try again.");
      });
  }, []);

  return (
    <div className="orders-page">
  <h1 className="page-title">Orders Page</h1>
  {error ? (
    <p className="error-message">{error}</p>
  ) : (
    <ul className="order-list">
      {orders.map((order) => (
        <li key={order.id} className="order-item">
          Order #{order.id} - Status: {order.status}
        </li>
      ))}
    </ul>
  )}
</div>
  );
};

export default OrdersPage;
