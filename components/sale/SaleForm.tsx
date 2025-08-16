"use client";

import React, { useState } from "react";
import { Table, Product, Sale, SaleItem, PaymentType } from "@/types";
import {
  TableSelector,
  ProductSelector,
  SaleItemsList,
  CustomerSelector,
  PaymentSection,
} from "@/components/sale";
import { createSale, addItemToSale } from "@/actions/table";
import { useTableSalesCache } from "@/hooks/useTableSalesCache";

interface SaleFormProps {
  initialTables?: Table[];
  onSaleComplete?: (sale: Sale) => void;
}

export interface SaleFormData {
  table: Table | null;
  saleItems: SaleItem[];
  customerName?: string;
  paymentType: PaymentType;
  paidAmount?: number;
  isOnCredit: boolean;
  note?: string;
}

const SaleForm: React.FC<SaleFormProps> = ({ initialTables = [], onSaleComplete }) => {
  const [saleData, setSaleData] = useState<SaleFormData>({
    table: null,
    saleItems: [],
    paymentType: PaymentType.CASH,
    isOnCredit: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const { loading: loadingExistingSale, getTableSales, invalidateTableCache } = useTableSalesCache();

  const updateSaleData = (updates: Partial<SaleFormData>) => {
    setSaleData(prev => ({ ...prev, ...updates }));
  };

  const handleTableSelect = async (table: Table, hasActiveSales?: boolean) => {
    updateSaleData({ table });

    if (hasActiveSales && table.isOpen) {
      try {
        const cachedData = await getTableSales(table.id);
        updateSaleData({ saleItems: cachedData.combinedSaleItems });
      } catch (error) {
        console.error("Failed to load existing sales:", error);
        updateSaleData({ saleItems: [] });
      }
    } else {
      // Clear sale items for new tables or tables without active sales
      updateSaleData({ saleItems: [] });
    }
  };

  const addSaleItem = (product: Product, quantity: number) => {
    const existingItemIndex = saleData.saleItems.findIndex(
      item => item.productId === product.id
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...saleData.saleItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updateSaleData({ saleItems: updatedItems });
    } else {
      const newItem: SaleItem = {
        id: `temp-${Date.now()}`,
        saleId: "",
        productId: product.id,
        quantity,
        unitPrice: product.price,
        product,
      };
      updateSaleData({ saleItems: [...saleData.saleItems, newItem] });
    }
  };

  const updateSaleItem = (itemId: string, quantity: number) => {
    const updatedItems = saleData.saleItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    updateSaleData({ saleItems: updatedItems });
  };

  const removeSaleItem = (itemId: string) => {
    const updatedItems = saleData.saleItems.filter(item => item.id !== itemId);
    updateSaleData({ saleItems: updatedItems });
  };

  const calculateTotal = () => {
    return saleData.saleItems.reduce(
      (total, item) => total + (item.unitPrice * item.quantity),
      0
    );
  };

  const canSaveOrder = () => {
    return saleData.table && saleData.saleItems.length > 0 && !isSubmitting;
  };

  const canFinalizeOrder = () => {
    if (!canSaveOrder()) return false;
    if (!isFinalizing) return true;
    
    // If finalizing, check payment requirements
    if (saleData.isOnCredit) return true;
    
    // For immediate payment, ensure payment details are valid
    const total = calculateTotal();
    return saleData.paidAmount !== undefined && saleData.paidAmount >= total;
  };

  const handleSaveOrder = async () => {
    if (!canSaveOrder() || !saleData.table) return;

    setIsSubmitting(true);
    try {
      // Create the sale without payment
      const newSale = await createSale(saleData.table.id);
      
      // Add all items to the sale
      for (const item of saleData.saleItems) {
        await addItemToSale(newSale.id, item.productId, item.quantity);
      }

      alert("Order saved successfully!");
      
      // Invalidate cache for this table
      if (saleData.table) {
        invalidateTableCache(saleData.table.id);
      }
      
      // Reset form after saving
      setSaleData({
        table: null,
        saleItems: [],
        paymentType: PaymentType.CASH,
        isOnCredit: false,
      });
      setIsFinalizing(false);

    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleFinalizeAndPay = async () => {
    if (!canFinalizeOrder() || !saleData.table) return;

    if (!isFinalizing) {
      setIsFinalizing(true);
      return;
    }

    setIsSubmitting(true);
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
          paymentType: newSale.paymentType as PaymentType || saleData.paymentType,
          paidAmount: newSale.paidAmount || saleData.paidAmount,
          note: newSale.note || saleData.note,
          createdById: newSale.createdById || undefined,
          saleItems: [],
          customers: [],
        };
        onSaleComplete(completeSale);
      }

      alert(saleData.isOnCredit ? "Sale created on credit!" : "Sale completed successfully!");
      
      // Invalidate cache for this table
      if (saleData.table) {
        invalidateTableCache(saleData.table.id);
      }
      
      // Reset form after completion
      setSaleData({
        table: null,
        saleItems: [],
        paymentType: PaymentType.CASH,
        isOnCredit: false,
      });
      setIsFinalizing(false);

    } catch (error) {
      console.error("Failed to finalize sale:", error);
      alert("Failed to finalize sale. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getValidationMessage = () => {
    if (!saleData.table) return "Please select a table";
    if (saleData.saleItems.length === 0) return "Please add at least one item";
    
    if (isFinalizing && !saleData.isOnCredit) {
      const total = calculateTotal();
      if (!saleData.paidAmount) return "Please enter the amount received";
      if (saleData.paidAmount < total) return "Paid amount is less than total";
    }
    
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="max-w-full mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isFinalizing 
            ? "Payment Details" 
            : (saleData.saleItems.length > 0 && saleData.table ? "Edit Order" : "New Sale")
          }
        </h1>
        
        {!isFinalizing ? (
          // Sale Items View - Show product selection and order building
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <TableSelector
                selectedTable={saleData.table}
                onTableSelect={handleTableSelect}
                initialTables={initialTables}
              />
              
              <CustomerSelector
                customerName={saleData.customerName}
                onCustomerSelect={(customerName) => updateSaleData({ customerName })}
              />
            </div>

            {/* Product Selector */}
            <div className="space-y-6">
              <ProductSelector
                onProductAdd={addSaleItem}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <SaleItemsList
                items={saleData.saleItems}
                onUpdateItem={updateSaleItem}
                onRemoveItem={removeSaleItem}
                total={calculateTotal()}
                loading={loadingExistingSale}
              />
            </div>
          </div>
        ) : (
          // Payment Details View - Show only payment section and order summary
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              <SaleItemsList
                items={saleData.saleItems}
                onUpdateItem={updateSaleItem}
                onRemoveItem={removeSaleItem}
                total={calculateTotal()}
                loading={loadingExistingSale}
                readOnly={true}
              />
            </div>
            
            {/* Right Column - Payment Details */}
            <div className="space-y-6">
              <PaymentSection
                paymentType={saleData.paymentType}
                paidAmount={saleData.paidAmount}
                isOnCredit={saleData.isOnCredit}
                note={saleData.note}
                total={calculateTotal()}
                onPaymentChange={(updates) => updateSaleData(updates)}
                onBack={() => setIsFinalizing(false)}
              />
            </div>
          </div>
        )}
        
        {/* Action Buttons Section */}
        <div className="mt-6 space-y-4">
          {/* Validation Messages */}
          {validationMessage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 text-sm font-medium">
                {validationMessage}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isFinalizing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleSaveOrder}
                disabled={!canSaveOrder() || isSubmitting}
                className={`py-3 px-4 font-semibold rounded-lg transition-colors ${
                  canSaveOrder() && !isSubmitting
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-400 cursor-not-allowed text-white"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Order"}
              </button>
              
              <button
                onClick={handleFinalizeAndPay}
                disabled={!canSaveOrder() || isSubmitting}
                className={`py-3 px-4 font-semibold rounded-lg transition-colors ${
                  canSaveOrder() && !isSubmitting
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-400 cursor-not-allowed text-white"
                }`}
              >
                Finalize & Pay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsFinalizing(false)}
                disabled={isSubmitting}
                className="py-3 px-4 font-semibold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Order
              </button>
              
              <button
                onClick={handleFinalizeAndPay}
                disabled={!canFinalizeOrder() || isSubmitting}
                className={`py-3 px-4 font-semibold rounded-lg transition-colors ${
                  canFinalizeOrder() && !isSubmitting
                    ? saleData.isOnCredit 
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-400 cursor-not-allowed text-white"
                }`}
              >
                {isSubmitting 
                  ? "Processing..." 
                  : saleData.isOnCredit 
                    ? "Create Sale (On Credit)" 
                    : "Complete Payment"
                }
              </button>
            </div>
          )}

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
                    ₺{calculateTotal().toFixed(2)}
                  </span>
                </div>
                {isFinalizing && !saleData.isOnCredit && (
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
                {isFinalizing && saleData.isOnCredit && (
                  <div className="flex justify-between text-orange-600">
                    <span>Status:</span>
                    <span className="font-medium">On Credit</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleForm; 