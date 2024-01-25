// EditProductPage.js

import React, { useState, useEffect } from "react";

const EditProductPage = ({ match }) => {
  const productId = match.params.productId;
  const [product, setProduct] = useState({});
  const [updatedProduct, setUpdatedProduct] = useState({});

  useEffect(() => {
    // Fetch product details from the API
    fetch(`/api/products/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setUpdatedProduct(data); // Initialize updatedProduct with current data
      })
      .catch((error) =>
        console.error("Error fetching product details:", error)
      );
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleUpdateProduct = () => {
    // Update product details using the API
    fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Product updated successfully", data);
        // Add any further logic as needed
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  return (
    <div>
      <h2>Edit Product</h2>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={updatedProduct.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          name="description"
          value={updatedProduct.description}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="text"
          name="price"
          value={updatedProduct.price}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Quantity in Stock:</label>
        <input
          type="text"
          name="quantity_in_stock"
          value={updatedProduct.quantity_in_stock}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleUpdateProduct}>Update Product</button>
    </div>
  );
};

export default EditProductPage;
