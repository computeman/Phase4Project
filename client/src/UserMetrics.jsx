import React, { useState, useEffect } from "react";
import './usermetrics.css'; // Import your CSS file

const UserMetrics = () => {
  const [totalProfit, setTotalProfit] = useState(null);
  const [mostProfitableProduct, setMostProfitableProduct] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Retrieve user_id from localStorage
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);

    if (storedUserId) {
      // Fetch user metrics if user_id is available
      fetchUserMetrics(storedUserId);
    }
  }, []);

  const fetchUserMetrics = async (userId) => {
    try {
      // Fetch Total Profit
      const totalProfitResponse = await fetch(
        `http://localhost:5000/user_profit/${userId}`
      );
      const totalProfitData = await totalProfitResponse.json();
      setTotalProfit(totalProfitData.total_profit);

      // Fetch Most Profitable Product
      const mostProfitableProductResponse = await fetch(
        `http://localhost:5000/most_profitable_product/${userId}`
      );
      const mostProfitableProductData =
        await mostProfitableProductResponse.json();
      setMostProfitableProduct(
        mostProfitableProductData.most_profitable_product
      );

      // Fetch Order History
      const orderHistoryResponse = await fetch(
        `http://localhost:5000/order_history/${userId}`
      );
      const orderHistoryData = await orderHistoryResponse.json();
      setOrderHistory(orderHistoryData.order_history);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
    }
  };

  return (
    <div className="user-metrics"> {/* Apply the new class name here */}
      <h1>User Metrics</h1>

      {userId ? (
        <>
          <div className="metric">
            <h2>Total Profit</h2>
            <p>{totalProfit !== null ? `$${totalProfit}` : "Loading..."}</p>
          </div>

          <div className="metric">
            <h2>Most Profitable Product</h2>
            <p>
              {mostProfitableProduct !== null
                ? `${mostProfitableProduct.product_name} - $${mostProfitableProduct.profit}`
                : "Loading..."}
            </p>
          </div>

          <div className="metric">
            <h2>Order History</h2>
            <ul>
              {orderHistory.map((order) => (
                <li key={order.order_id}>
                  <strong>Order #{order.order_id}</strong> - Status:{" "}
                  {order.status}
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.product_id}>
                        {item.product_name} - Quantity: {item.quantity} - Total
                        Price: ${item.total_price}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>User ID not available. Please log in to view metrics.</p>
      )}
    </div>
  );
};

export default UserMetrics;
