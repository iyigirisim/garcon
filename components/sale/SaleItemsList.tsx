"use client";

import React from "react";
import { SaleItem } from "@/types";

interface SaleItemsListProps {
  items: SaleItem[];
  onUpdateItem: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  total: number;
  loading?: boolean;
  readOnly?: boolean;
}

const SaleItemsList: React.FC<SaleItemsListProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  total,
  loading = false,
  readOnly = false
}) => {
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateItem(itemId, newQuantity);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {readOnly ? "Order Summary" : "Sale Items"}
      </h3>
      
      {loading ? (
        <div className="text-center py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          <div className="text-blue-800 font-medium mb-2">
            Loading existing orders...
          </div>
          <div className="text-blue-600 text-sm">
            Please wait while we fetch the current order details.
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-l">
          No items added yet. <br />
          Select products to add them to the sale.
        </div>
      ) : (
        <>
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
                  {!readOnly ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      {/* Quantity Display (Read-only) */}
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Adet:</span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="w-20 text-right font-semibold text-emerald-600">
                        ₺{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </>
                  )}
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
        </>
      )}
    </div>
  );
};

export default SaleItemsList; 