"use client";

import React, { useState, useEffect } from "react";
import { Table, Product } from "@/types";
import { getProducts, createSale, addItemToSale, getActiveSalesByTable } from "@/actions/table";
import { X, ArrowLeft, Minus, Plus } from "lucide-react";

interface AddOrderModalProps {
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
  onItemAdded?: () => void;
}

// Simple in-memory cache
let productsCache: Product[] = [];
let isProductsCached = false;

const AddOrderModal: React.FC<AddOrderModalProps> = ({ table, onClose, onSuccess, onItemAdded }) => {
  const [products, setProducts] = useState<Product[]>(productsCache);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    if (table) {
      loadCurrentSale();
    }
  }, [table]);

  const loadProducts = async () => {
    if (isProductsCached) {
      setProducts(productsCache);
      return;
    }

    try {
      const allProducts = await getProducts();
      productsCache = allProducts as Product[];
      isProductsCached = true;
      setProducts(allProducts as Product[]);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadCurrentSale = async () => {
    if (!table) return;
    try {
      const sales = await getActiveSalesByTable(table.id);
      if (sales.length > 0) {
        setCurrentSaleId(sales[0].id);
      }
    } catch (error) {
      console.error("Failed to load current sale:", error);
    }
  };

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.mainCategory)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.mainCategory === selectedCategory;
    return matchesSearch && matchesCategory && product.isAvailable;
  });

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      setQuantities((prev) => ({ ...prev, [productId]: quantity }));
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!table) return;

    setIsLoading(true);
    try {
      let saleId = currentSaleId;

      // Create a new sale if there isn't one
      if (!saleId) {
        const newSale = await createSale(table.id);
        saleId = newSale.id;
        setCurrentSaleId(saleId);
      }

      // Add the item to the sale
      const quantity = getQuantity(product.id);
      await addItemToSale(saleId, product.id, quantity);

      // Reset quantity
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
      
      // Notify parent
      if (onItemAdded) {
        onItemAdded();
      }

      // Show success feedback
      // alert(`${quantity}x ${product.name} ${table.name} masasına eklendi`);
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Ürün eklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{table.name} Masasına Sipariş Ekle</h3>
              {table.customerName && (
                <p className="text-sm text-gray-600">{table.customerName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            {/* Categories */}
            {selectedCategory === "all" && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Kategoriler</h4>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {categories
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className="h-32 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center text-center"
                      >
                        <span className="font-medium text-gray-800 text-sm">{category}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Back Button */}
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="mb-4 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Kategorilere Dön
              </button>
            )}

            {/* Products */}
            {(selectedCategory !== "all" || searchTerm) && (
              <div>
                {selectedCategory !== "all" && (
                  <h4 className="text-md font-medium text-gray-700 mb-3">{selectedCategory}</h4>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-800 text-sm leading-tight mb-1">
                          {product.name}
                        </h5>
                        <div className="text-sm font-semibold text-emerald-600">
                          ₺{product.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {getQuantity(product.id)}
                        </span>
                        <button
                          onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleAddProduct(product)}
                          disabled={isLoading}
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {(selectedCategory !== "all" || searchTerm) && filteredProducts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Arama kriterlerinize uygun ürün bulunamadı.
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;



