"use client";

import React, { useState } from "react";
import { Table, Product, Sale, SaleItem, PaymentType } from "@/types";
import TableSelector from "./TableSelector";
import ProductSelector from "./ProductSelector";
import SaleItemsList from "./SaleItemsList";
import CustomerSelector from "./CustomerSelector";
import PaymentSection from "./PaymentSection";
import SaleSubmitButton from "./SaleSubmitButton";

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

  const updateSaleData = (updates: Partial<SaleFormData>) => {
    setSaleData(prev => ({ ...prev, ...updates }));
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

  const canSubmit = () => {
    return saleData.table && saleData.saleItems.length > 0 && !isSubmitting;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">New Sale</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TableSelector
              selectedTable={saleData.table}
              onTableSelect={(table) => updateSaleData({ table })}
              initialTables={initialTables}
            />
            
            <CustomerSelector
              customerName={saleData.customerName}
              onCustomerSelect={(customerName) => updateSaleData({ customerName })}
            />
            
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
            />
            
            <PaymentSection
              paymentType={saleData.paymentType}
              paidAmount={saleData.paidAmount}
              isOnCredit={saleData.isOnCredit}
              note={saleData.note}
              total={calculateTotal()}
              onPaymentChange={(updates) => updateSaleData(updates)}
            />
            
            <SaleSubmitButton
              canSubmit={canSubmit()}
              isSubmitting={isSubmitting}
              saleData={saleData}
              onSubmit={setIsSubmitting}
              onSaleComplete={onSaleComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleForm; 