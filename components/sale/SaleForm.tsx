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
  currentStep: number; // 1: Table & Customer, 2: Products, 3: Review, 4: Payment
  onStepChange?: (step: number) => void;
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

const SaleForm: React.FC<SaleFormProps> = ({ initialTables = [], onSaleComplete, currentStep, onStepChange }) => {
  const [saleData, setSaleData] = useState<SaleFormData>({
    table: null,
    saleItems: [],
    paymentType: PaymentType.CASH,
    isOnCredit: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    // If paying now, ensure payment details are valid
    if (saleData.isOnCredit) return true;
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
      if (onStepChange) onStepChange(1);

    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleFinalizeAndPay = async () => {
    if (!canFinalizeOrder() || !saleData.table) return;

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
          paymentType: (newSale.paymentType as PaymentType) || saleData.paymentType,
          paidAmount: newSale.paidAmount || saleData.paidAmount,
          note: newSale.note || saleData.note,
          saleItems: [], // These are overridden anyway
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
      if (onStepChange) onStepChange(1);

    } catch (error) {
      console.error("Failed to finalize sale:", error);
      alert("Failed to finalize sale. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getValidationMessage = () => {
    // Progressive validation based on current step
    if (currentStep >= 1 && !saleData.table) return "Please select a table";
    if (currentStep >= 3 && saleData.saleItems.length === 0) return "Please add at least one item";
    if (currentStep === 4 && !saleData.isOnCredit) {
      const total = calculateTotal();
      if (!saleData.paidAmount) return "Please enter the amount received";
      if (saleData.paidAmount < total) return "Paid amount is less than total";
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return Boolean(saleData.table);
    }
    if (currentStep === 2) {
      return saleData.saleItems.length > 0;
    }
    if (currentStep === 3) {
      return saleData.saleItems.length > 0;
    }
    return false;
  };

  const goToPreviousStep = () => {
    if (!onStepChange) return;
    onStepChange(Math.max(1, currentStep - 1));
  };

  const goToNextStep = () => {
    if (!onStepChange) return;
    if (!canProceedToNext()) return;
    onStepChange(Math.min(4, currentStep + 1));
  };

  return (
    <div className="max-w-full mx-auto p-6 space-y-6 h-full">
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentStep === 4
            ? "Payment Details"
            : currentStep === 3
              ? "Review Order"
              : currentStep === 2
                ? "Add Products"
                : "New Sale"}
        </h1>

            {/* Step Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentStep === 1
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Previous
              </button>
              {currentStep < 4 && (
                <button
                  onClick={goToNextStep}
                  disabled={!canProceedToNext()}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    canProceedToNext()
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              )}
            </div>
        </div>
        {validationMessage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 text-sm font-medium">
                {validationMessage}
              </div>
            </div>
          )}

        {currentStep === 1 && (
          <div className="flex flex-col gap-6">
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
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <ProductSelector onProductAdd={addSaleItem} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-1 gap-6">
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
        )}

        {currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="space-y-6">
              <PaymentSection
                paymentType={saleData.paymentType}
                paidAmount={saleData.paidAmount}
                isOnCredit={saleData.isOnCredit}
                note={saleData.note}
                total={calculateTotal()}
                onPaymentChange={(updates) => updateSaleData(updates)}
                onBack={onStepChange ? () => onStepChange(3) : undefined}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {currentStep === 4 && (
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
                    : "Complete Payment"}
              </button>
            </div>
          )}

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
                  <span className="font-medium">₺{calculateTotal().toFixed(2)}</span>
                </div>
                {currentStep === 4 && !saleData.isOnCredit && (
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
                {currentStep === 4 && saleData.isOnCredit && (
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