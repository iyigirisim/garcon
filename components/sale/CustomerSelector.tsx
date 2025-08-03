"use client";

import React, { useState } from "react";

interface CustomerSelectorProps {
  customerName?: string;
  onCustomerSelect: (customerName?: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customerName,
  onCustomerSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName || "");

  const handleSave = () => {
    onCustomerSelect(tempCustomerName.trim() || undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempCustomerName(customerName || "");
    setIsEditing(false);
  };

  const handleClear = () => {
    onCustomerSelect(undefined);
    setTempCustomerName("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
      
      {!isEditing ? (
        <div className="space-y-3">
          {customerName ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-emerald-700 font-medium">Customer</div>
                  <div className="text-emerald-800 font-semibold">{customerName}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="text-gray-500 mb-2">No customer assigned</div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter customer name"
            value={tempCustomerName}
            onChange={(e) => setTempCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Press Enter to save, Escape to cancel
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector; 