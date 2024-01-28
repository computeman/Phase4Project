import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import './editproductpage.css'

const EditProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [updatedProduct, setUpdatedProduct] = useState({});

  useEffect(() => {
    // Update product details using the API
    const token = localStorage.getItem("access_token");
    // Fetch product details from the API
    fetch(`http://localhost:5000/api/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
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
    const token = localStorage.getItem("access_token");

    fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    <div className="edit-product">
      <h1>Edit Product</h1>
      <div className="form-group">
        <label className="label">Name:</label>
        <input
          type="text"
          name="name"
          value={updatedProduct.name || ""}
          onChange={handleInputChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="label">Description:</label>
        <input
          type="text"
          name="description"
          value={updatedProduct.description || ""}
          onChange={handleInputChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="label">Price:</label>
        <input
          type="text"
          name="price"
          value={updatedProduct.price || ""}
          onChange={handleInputChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="label">Cost of Purchase:</label>
        <input
          type="text"
          name="costofpurchase"
          value={updatedProduct.costofpurchase || ""}
          onChange={handleInputChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="label">Quantity in Stock:</label>
        <input
          type="text"
          name="quantity_in_stock"
          value={updatedProduct.quantity_in_stock || ""}
          onChange={handleInputChange}
          className="input"
        />
      </div>
      <button onClick={handleUpdateProduct} className="update-button">
        Update Product
      </button>
    </div>
  );
};

export default EditProductPage;
