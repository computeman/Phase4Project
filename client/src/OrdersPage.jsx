import React, { useEffect, useState } from "react";
import "./orderpage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://127.0.0.1:5000/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Corrected the template literal
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized access. Please log in.");
          } else {
            throw new Error("Error fetching orders");
          }
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        setOrders(data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders. Please try again.");
      });
  }, []);

  const handleDeleteOrder = (orderId) => {
    const token = localStorage.getItem("access_token");

    fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Corrected the template literal
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error deleting order");
        }
        return response.json();
      })
      .then(() => {
        // Remove the deleted order from the state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
      })
      .catch((error) => {
        console.error("Error deleting order:", error);
        setError("Error deleting order. Please try again.");
      });
  };

  return (
    <div className="orders-page">
      <h2>Orders Page</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              Order #{order.id} - Status: {order.status}
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className="delete-button"
              >
                Delete Order
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
