import React, { useEffect, useState } from "react";

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

  const handleDeleteOrder = (orderId) => {
    const token = localStorage.getItem("access_token");
    fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error deleting order");
        }
        // Update orders list after successful deletion
        setOrders(orders.filter((order) => order.id !== orderId));
      })
      .catch((error) => {
        console.error("Error deleting order:", error);
        setError("Error deleting order. Please try again.");
      });
  };

  return (
    <div>
      <h2>Orders Page</h2>
      {error ? (
        <p>{error}</p>
        
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order #{order.id} - Status: {order.status}
              <button onClick={() => handleDeleteOrder(order.id)}>
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
