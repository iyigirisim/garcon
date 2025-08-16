"use client";

import React, { useState, useEffect  } from "react";
import { Product } from "@/types";
import { getProducts } from "@/actions/table";

interface ProductSelectorProps {
  onProductAdd: (product: Product, quantity: number) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductAdd }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProducts();
      setAvailableProducts(products as Product[]);
    };
    fetchProducts();
  }, []);

  const categories = ["all", ...Array.from(new Set(availableProducts.map(p => p.mainCategory)))];

  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.mainCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      setQuantities(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const handleAddProduct = (product: Product) => {
    const quantity = getQuantity(product.id);
    onProductAdd(product, quantity);
    // Reset quantity to 1 after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Add Products</h3>
      
      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      
      {/* Categories Grid - Only show if no category is selected or "all" is selected */}
      {selectedCategory === "all" && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Categories</h4>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {categories.filter(cat => cat !== "all").map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="aspect-square p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center text-center"
              >
                <span className="font-medium text-gray-800 text-sm">
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back to Categories Button - Show when a specific category is selected */}
      {selectedCategory !== "all" && (
        <button
          onClick={() => setSelectedCategory("all")}
          className="mb-4 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
        >
          ← Back to Categories
        </button>
      )}

      {/* Products Grid - Only show when a specific category is selected or when searching */}
      {(selectedCategory !== "all" || searchTerm) && (
        <div>
          {selectedCategory !== "all" && (
            <h4 className="text-md font-medium text-gray-700 mb-3">
              {selectedCategory}
            </h4>
          )}
          <div className="grid grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto min-h-60">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="h-max border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200"
              >
                {/* Product Image */}
                {/* <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div> */}
                
                {/* Product Name and Price */}
                <div className="mb-3">
                  <h5 className="font-medium text-gray-800 text-sm leading-tight mb-1">
                    {product.name}
                  </h5>
                  <div className="text-sm font-semibold text-emerald-600">
                    ₺{product.price.toFixed(2)}
                  </div>
                </div>
                
                {/* Quantity Controls and Add Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-sm">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-1/2 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No products found message */}
      {(selectedCategory !== "all" || searchTerm) && filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No products found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ProductSelector; 