import React, { useState, useEffect } from "react";

const OrderFormPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState("processing");
  const [orderMessage, setOrderMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Fetch products from the API with the JWT token
    fetch("http://localhost:5000/api/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized access, handle accordingly (e.g., redirect to login)
            throw new Error("Unauthorized");
          } else {
            throw new Error("Error fetching products");
          }
        }
        return response.json();
      })
      .then((data) => setProducts(data.products))
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Error fetching products. Please try again.");
      });
  }, []);

  const handleProductSelect = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSubmitOrder = () => {
    const token = localStorage.getItem("access_token");

    // Ensure that the token exists
    if (token) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      // Submit order to the API
      const orderData = {
        user_id: userId,
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })
        .then((response) => response.json())
        .then((data) => {
          setOrderMessage({
            type: "success",
            text: "Order submitted successfully",
          });
        })
        .catch((error) => {
          setOrderMessage({
            type: "error",
            text: "Error submitting order",
          });
          console.error("Error submitting order:", error);
        });
    } else {
      console.error("Token is missing");
    }
  };

  return (
    <div>
      <h2>Order Form</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
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
        </>
      )}
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
