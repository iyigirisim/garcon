"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { products } from "@/actions/product";

interface ProductSelectorProps {
  onProductAdd: (product: Product, quantity: number) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductAdd }) => {
  const [availableProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

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
      
      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-800">{product.name}</div>
              <div className="text-sm text-gray-600">{product.description}</div>
              <div className="text-sm font-semibold text-emerald-600">
                ₺{product.price.toFixed(2)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">
                  {getQuantity(product.id)}
                </span>
                <button
                  onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={() => handleAddProduct(product)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No products found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ProductSelector; 