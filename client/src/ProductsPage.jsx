import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./productsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleProductClick = (productId) => {
    setSelectedProduct(productId);
  };

  return (
    <div className="page-container">
      <h1 className="products-page">Products Page</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
              <span className="product-name">{product.name}</span> -{" "}
              <span className="product-description">{product.description}</span> - $
              <span className="product-price">{product.price}</span> - Cost: $
              <span className="product-cost">{product.costofpurchase}</span>{" "}
              <Link to={`/edit-product/${product.id}`} className="edit-link">
                Edit
              </Link>{" "}
              <button
                onClick={() => handleProductClick(product.id)}
                className="order-button"
              >
                Order
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedProduct && (
        <div className="selected-product">
          <p>
            Selected Product ID:{" "}
            <span className="selected-product-id">{selectedProduct}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
