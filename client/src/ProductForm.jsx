// ProductForm.jsx
import React, { useState } from "react";
import "./ProductForm.css"; // Import the CSS file

const ProductForm = ({ user_id }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    costofpurchase: 0,
    price: 0,
    quantity_in_stock: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateProduct = async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: user_id,
        }),
      });

      if (response.ok) {
        console.log("Product created successfully");
      } else {
        console.error("Error creating product:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div className="product-form">
      <h2>Create Product</h2>
      <label>
        Product Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="input"
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="input"
        />
      </label>
      <label>
        Cost of Purchase:
        <input
          type="number"
          name="costofpurchase"
          value={formData.costofpurchase}
          onChange={handleInputChange}
          className="input"
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          className="input"
        />
      </label>
      <label>
        Quantity in Stock:
        <input
          type="number"
          name="quantity_in_stock"
          value={formData.quantity_in_stock}
          onChange={handleInputChange}
          className="input"
        />
      </label>
      <button onClick={handleCreateProduct} className="create-button">
        Create Product
      </button>
    </div>
  );
};

export default ProductForm;
