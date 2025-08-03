"use client";

import React from "react";
import { Sale } from "@/types";
import { SaleFormData } from "./SaleForm";
import { createSale, addItemToSale } from "@/actions/table";

interface SaleSubmitButtonProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  saleData: SaleFormData;
  onSubmit: (submitting: boolean) => void;
  onSaleComplete?: (sale: Sale) => void;
}

const SaleSubmitButton: React.FC<SaleSubmitButtonProps> = ({
  canSubmit,
  isSubmitting,
  saleData,
  onSubmit,
  onSaleComplete
}) => {
  const handleSubmit = async () => {
    if (!canSubmit || !saleData.table) return;

    onSubmit(true);
    try {
      // Create the sale
      const newSale = await createSale(saleData.table.id);
      
      // Add all items to the sale
      for (const item of saleData.saleItems) {
        await addItemToSale(newSale.id, item.productId, item.quantity);
      }

      // TODO: Complete the sale with payment information
      // This would involve updating the sale with payment details
      // await completeSale(newSale.id, saleData.paymentType, saleData.paidAmount);

              if (onSaleComplete) {
          // Convert to complete Sale type with required properties
          const completeSale: Sale = {
            ...newSale,
            paidAt: newSale.paidAt || undefined,
            paymentType: newSale.paymentType || undefined,
            paidAmount: newSale.paidAmount || undefined,
            note: newSale.note || undefined,
            createdById: newSale.createdById || undefined,
            saleItems: [],
            customers: [],
          };
          onSaleComplete(completeSale);
        }

      // Success feedback could be added here
      alert("Sale completed successfully!");

    } catch (error) {
      console.error("Failed to create sale:", error);
      alert("Failed to create sale. Please try again.");
    }
    onSubmit(false);
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Processing...";
    if (saleData.isOnCredit) return "Create Sale (On Credit)";
    return "Complete Sale";
  };

  const getSubmitButtonStyle = () => {
    if (!canSubmit) {
      return "bg-gray-400 cursor-not-allowed";
    }
    if (saleData.isOnCredit) {
      return "bg-orange-600 hover:bg-orange-700";
    }
    return "bg-emerald-600 hover:bg-emerald-700";
  };

  // Validation messages
  const getValidationMessage = () => {
    if (!saleData.table) return "Please select a table";
    if (saleData.saleItems.length === 0) return "Please add at least one item";
    if (!saleData.isOnCredit && saleData.paidAmount && saleData.paidAmount < saleData.saleItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)) {
      return "Paid amount is less than total";
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="space-y-4">
      {/* Validation Messages */}
      {validationMessage && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-yellow-800 text-sm font-medium">
            {validationMessage}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={`w-full py-4 text-white font-semibold rounded-lg transition-colors ${getSubmitButtonStyle()}`}
      >
        {getSubmitButtonText()}
      </button>

      {/* Sale Summary */}
      {saleData.saleItems.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="text-sm font-medium text-gray-700">Sale Summary</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Table:</span>
              <span className="font-medium">{saleData.table?.name || "Not selected"}</span>
            </div>
            {saleData.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{saleData.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Items:</span>
              <span className="font-medium">{saleData.saleItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">
                ₺{saleData.saleItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            {!saleData.isOnCredit && (
              <>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-medium">{saleData.paymentType}</span>
                </div>
                {saleData.paidAmount && (
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span className="font-medium">₺{saleData.paidAmount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            {saleData.isOnCredit && (
              <div className="flex justify-between text-orange-600">
                <span>Status:</span>
                <span className="font-medium">On Credit</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleSubmitButton; 