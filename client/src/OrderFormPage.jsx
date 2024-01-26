import React, { useState, useEffect } from "react";

const OrderFormPage = () => {
  // State variables to manage products, selected products, order message, and error
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderMessage, setOrderMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch products from the API when the component mounts
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
        setProducts(data.products);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Error fetching products. Please try again.");
      });
  }, []);

  // Function to handle product selection
  const handleProductSelect = (productId, quantity) => {
    const product = products.find((product) => product.id === productId);

    if (product) {
      const existingProductIndex = selectedProducts.findIndex(
        (selectedProduct) => selectedProduct.id === productId
      );

      if (existingProductIndex !== -1) {
        // Remove the product if it is already selected
        setSelectedProducts((prevSelected) =>
          prevSelected.filter(
            (selectedProduct) => selectedProduct.id !== productId
          )
        );
      } else {
        // Add the product to the selected list with quantity
        setSelectedProducts((prevSelected) => [
          ...prevSelected,
          { id: product.id, quantity: parseInt(quantity) || 1 },
        ]);
      }
    }
  };

  // Function to handle order submission
  const handleSubmitOrder = () => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    // Ensure that the token exists
    if (token) {
      // Check if userId is present
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      // Submit order items to the API
      const orderItemsData = {
        user_id: userId, // Use userId from the state variable
        status: "your_status_here", // Replace with your desired order status
        items: selectedProducts.map(({ id, quantity }) => ({
          product_id: id,
          quantity: parseInt(quantity),
        })),
      };

      fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  // JSX for rendering the component
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
                    value={
                      selectedProducts.find(
                        (selectedProduct) => selectedProduct.id === product.id
                      )?.quantity || 1
                    }
                    onChange={(e) =>
                      handleProductSelect(product.id, e.target.value)
                    }
                  />
                  <button
                    onClick={() =>
                      handleProductSelect(
                        product.id,
                        selectedProducts.find(
                          (selectedProduct) => selectedProduct.id === product.id
                        )?.quantity
                      )
                    }
                    style={{
                      backgroundColor: selectedProducts.some(
                        (selectedProduct) => selectedProduct.id === product.id
                      )
                        ? "orange"
                        : "inherit",
                    }}
                  >
                    {selectedProducts.some(
                      (selectedProduct) => selectedProduct.id === product.id
                    )
                      ? "Added to Order"
                      : "Add to Order"}
                  </button>
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
