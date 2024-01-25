import React, { useState, useEffect } from "react";

const OrderFormPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
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
      .then((data) => {
        const selectedProductsInit = {};
        data.products.forEach((product) => {
          selectedProductsInit[product.id] = {
            quantity: 1,
          };
        });
        setSelectedProducts(selectedProductsInit);
        setProducts(data.products);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Error fetching products. Please try again.");
      });
  }, []);

  const handleProductSelect = (productId, quantity) => {
    setSelectedProducts((prevSelected) => ({
      ...prevSelected,
      [productId]: { quantity },
    }));
  };

  const handleSubmitOrder = () => {
    const token = localStorage.getItem("access_token");

    // Ensure that the token exists
    if (token) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      // Submit order items to the API
      const orderItemsData = Object.entries(selectedProducts).map(
        ([productId, { quantity }]) => ({
          user_id: userId,
          product_id: parseInt(productId),
          quantity: parseInt(quantity),
        })
      );

      fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderItemsData),
      })
        .then((response) => response.json())
        .then((data) => {
          setOrderMessage({
            type: "success",
            text: "Order items submitted successfully",
          });
        })
        .catch((error) => {
          setOrderMessage({
            type: "error",
            text: "Error submitting order items",
          });
          console.error("Error submitting order items:", error);
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
                  <input
                    label="Quantity"
                    type="number"
                    value={selectedProducts[product.id]?.quantity || 1}
                    onChange={(e) =>
                      handleProductSelect(product.id, e.target.value)
                    }
                  />
                </li>
              ))}
            </ul>
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
