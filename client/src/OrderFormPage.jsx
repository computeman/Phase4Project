import React, { useState, useEffect } from "react";

const OrderFormPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState("processing");
  const [orderMessage, setOrderMessage] = useState(null);

  useEffect(() => {
    // Fetch products from the API
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleProductSelect = (productId) => {
    // Check if the product is already selected
    const isSelected = selectedProducts.includes(productId);

    if (isSelected) {
      // If selected, remove it from the list
      setSelectedProducts((prevSelected) =>
        prevSelected.filter((id) => id !== productId)
      );
    } else {
      // If not selected, add it to the list
      setSelectedProducts((prevSelected) => [...prevSelected, productId]);
    }
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
        setOrderMessage({
          type: "success",
          text: "Order submitted successfully",
        });
        // Add any further logic as needed
      })
      .catch((error) => {
        setOrderMessage({
          type: "error",
          text: "Error submitting order",
        });
        console.error("Error submitting order:", error);
      });
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
              <button
                onClick={() => handleProductSelect(product.id)}
                style={{
                  backgroundColor: selectedProducts.includes(product.id)
                    ? "orange"
                    : "inherit",
                }}
              >
                {selectedProducts.includes(product.id)
                  ? "Added to Order"
                  : "Add to Order"}
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
      {orderMessage && (
        <div
          style={{
            marginTop: "10px",
            color: orderMessage.type === "error" ? "red" : "green",
          }}
        >
          {orderMessage.text}
        </div>
      )}
    </div>
  );
};

export default OrderFormPage;
