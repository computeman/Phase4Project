import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    <div>
      <h2>Products Page</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - {product.description} - ${product.price} - Cost:
              ${product.costofpurchase}{" "}
              <Link to={`/edit-product/${product.id}`}>Edit</Link>{" "}
              <button onClick={() => handleProductClick(product.id)}>
                Order
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedProduct && (
        <div>
          <p>Selected Product ID: {selectedProduct}</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
