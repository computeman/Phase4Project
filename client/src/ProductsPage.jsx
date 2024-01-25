import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Fetch products from the API
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleProductClick = (productId) => {
    setSelectedProduct(productId);
  };

  return (
    <div>
      <h2>Products Page</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.description} - ${product.price}{" "}
            <Link to={`/edit-product/${product.id}`}>Edit</Link>{" "}
            <button onClick={() => handleProductClick(product.id)}>
              Order
            </button>
          </li>
        ))}
      </ul>
      {selectedProduct && (
        <div>
          <p>Selected Product ID: {selectedProduct}</p>
          {/* You can add more actions or components related to the selected product */}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
