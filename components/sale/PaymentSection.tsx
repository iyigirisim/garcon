"use client";

import React from "react";
import { PaymentType } from "@/types";

interface PaymentSectionProps {
  paymentType: PaymentType;
  paidAmount?: number;
  isOnCredit: boolean;
  note?: string;
  total: number;
  onPaymentChange: (updates: {
    paymentType?: PaymentType;
    paidAmount?: number;
    isOnCredit?: boolean;
    note?: string;
  }) => void;
  onBack?: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentType,
  paidAmount,
  isOnCredit,
  note,
  total,
  onPaymentChange,
  onBack
}) => {
  const paymentOptions = [
    { value: PaymentType.CASH, label: "Cash" },
    { value: PaymentType.CARD, label: "Card" },
    { value: PaymentType.FOOD_TICKET, label: "Food Ticket" },
    { value: PaymentType.OTHER, label: "Other" },
  ];

  const handlePaidAmountChange = (value: string) => {
    const amount = parseFloat(value);
    onPaymentChange({ 
      paidAmount: isNaN(amount) ? undefined : amount 
    });
  };

  const calculateChange = () => {
    if (!paidAmount || paidAmount <= total) return 0;
    return paidAmount - total;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Items
          </button>
        )}
      </div>
      
      {/* Credit Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isOnCredit"
          checked={isOnCredit}
          onChange={(e) => onPaymentChange({ isOnCredit: e.target.checked })}
          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isOnCredit" className="text-gray-700 font-medium">
          On Credit (Pay Later)
        </label>
      </div>

      {!isOnCredit && (
        <>
          {/* Payment Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onPaymentChange({ paymentType: option.value })}
                  className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                    paymentType === option.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₺</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={total.toFixed(2)}
                value={paidAmount?.toString() || ""}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onPaymentChange({ paidAmount: total })}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Exact
              </button>
              <button
                onClick={() => onPaymentChange({ paidAmount: Math.ceil(total / 10) * 10 })}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Round
              </button>
            </div>
          </div>

          {/* Change Calculation */}
          {paidAmount && paidAmount > total && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Change to give:</span>
                <span className="text-blue-800 font-bold text-lg">
                  ₺{calculateChange().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Insufficient Payment Warning */}
          {paidAmount && paidAmount < total && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-red-700 font-medium">Remaining amount:</span>
                <span className="text-red-800 font-bold">
                  ₺{(total - paidAmount).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Note */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Note (Optional)
        </label>
        <textarea
          placeholder="Add any notes about this sale..."
          value={note || ""}
          onChange={(e) => onPaymentChange({ note: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};

export default PaymentSection; 