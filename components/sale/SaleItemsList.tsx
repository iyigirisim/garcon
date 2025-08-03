"use client";

import React from "react";
import { SaleItem } from "@/types";

interface SaleItemsListProps {
  items: SaleItem[];
  onUpdateItem: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  total: number;
}

const SaleItemsList: React.FC<SaleItemsListProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  total
}) => {
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateItem(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Sale Items</h3>
        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
          No items added yet. Select products to add them to the sale.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Sale Items ({items.length})
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                {item.product?.name || "Unknown Product"}
              </div>
              <div className="text-sm text-gray-600">
                Unit Price: ₺{item.unitPrice.toFixed(2)}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              {/* Subtotal */}
              <div className="w-20 text-right font-semibold text-emerald-600">
                ₺{(item.unitPrice * item.quantity).toFixed(2)}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                title="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-800">Total:</span>
          <span className="text-xl font-bold text-emerald-600">
            ₺{total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SaleItemsList; 