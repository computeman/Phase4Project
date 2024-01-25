// OrdersPage.js

import React, { useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders from the API
    fetch("http://127.0.0.1:5000/orders")
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  return (
    <div>
      <h2>Orders Page</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            Order #{order.id} - Status: {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
