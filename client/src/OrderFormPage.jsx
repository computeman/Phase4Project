// OrderFormPage.js

import React, { useState, useEffect } from "react";

const OrderFormPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState("processing");

  useEffect(() => {
    // Fetch products from the API
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleProductSelect = (productId) => {
    setSelectedProducts((prevSelected) => [...prevSelected, productId]);
  };

  const handleSubmitOrder = () => {
    // Submit order to the API
    const orderData = {
      user_id: 1, // Assuming user is logged in
      status: orderStatus,
      items: selectedProducts.map((productId) => ({
        product_id: productId,
        quantity: 1,
      })),
    };

    fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order submitted successfully", data);
        // Add any further logic as needed
      })
      .catch((error) => console.error("Error submitting order:", error));
  };

  return (
    <div>
      <h2>Order Form</h2>
      <div>
        <label>Select Products:</label>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name}{" "}
              <button onClick={() => handleProductSelect(product.id)}>
                Add to Order
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label>Order Status:</label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
        >
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button onClick={handleSubmitOrder}>Submit Order</button>
    </div>
  );
};

export default OrderFormPage;
