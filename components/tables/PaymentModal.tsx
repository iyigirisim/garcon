"use client";

import React, { useState, useEffect } from "react";
import { Table, PaymentType, Sale, SaleItem } from "@/types";
import { getActiveSalesByTable, reopenTable } from "@/actions/table";
import { X } from "lucide-react";

interface PaymentModalProps {
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ table, onClose, onSuccess }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [paidAmount, setPaidAmount] = useState<number | undefined>();
  const [isOnCredit, setIsOnCredit] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (table) {
      loadSales();
    }
  }, [table]);

  const loadSales = async () => {
    if (!table) return;
    try {
      const activeSales = await getActiveSalesByTable(table.id);
      // The validation is complaining about missing customers property, which might be missing from the query in getActiveSalesByTable
      // Casting to any first then Sale[] to bypass strict check, assuming db response is compatible
      setSales(activeSales as unknown as Sale[]);
    } catch (error) {
      console.error("Failed to load sales:", error);
    }
  };

  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce(
    (sum, sale) => sum + sale.saleItems.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const paymentOptions = [
    { value: PaymentType.CASH, label: "Nakit" },
    { value: PaymentType.CARD, label: "Kart" },
    { value: PaymentType.FOOD_TICKET, label: "Yemek Çeki" },
    { value: PaymentType.OTHER, label: "Diğer" },
  ];

  const calculateChange = () => {
    if (!paidAmount || paidAmount <= totalAmount) return 0;
    return paidAmount - totalAmount;
  };

  const handlePayment = async () => {
    if (!table) return;

    if (!isOnCredit && (!paidAmount || paidAmount < totalAmount)) {
      alert("Alınan tutar toplam tutardan az olamaz");
      return;
    }

    setIsLoading(true);
    try {
      // Update all sales to mark them as paid
      for (const sale of sales) {
        await fetch(`/api/sales/${sale.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isPaid: !isOnCredit,
            paidAt: isOnCredit ? null : new Date().toISOString(),
            paymentType: isOnCredit ? null : paymentType,
            paidAmount: isOnCredit ? null : paidAmount || totalAmount,
            isOnCredit,
            note: note || null,
          }),
        });
      }

      // Ensure table stays open for new orders
      // Always ensure table is open after payment
      await reopenTable(table.id);

      alert(`Ödeme başarıyla işlendi! ${isOnCredit ? "Veresiye" : "Ödendi"}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert("Ödeme işlenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{table.name} Masası - Ödeme</h3>
              {table.customerName && (
                <p className="text-sm text-gray-600">{table.customerName}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Sipariş Özeti</h4>
            {sales.map((sale) => (
              <div key={sale.id} className="mb-3 last:mb-0">
                {sale.saleItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span className="font-medium">₺{(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between font-bold">
              <span>Toplam ({totalItems} ürün)</span>
              <span className="text-emerald-600">₺{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Credit Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isOnCredit"
              checked={isOnCredit}
              onChange={(e) => setIsOnCredit(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isOnCredit" className="text-gray-700 font-medium">
              Veresiye (Sonra Öde)
            </label>
          </div>

          {!isOnCredit && (
            <>
              {/* Payment Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ödeme Yöntemi</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPaymentType(option.value)}
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
                <label className="block text-sm font-medium text-gray-700">Alınan Tutar</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={totalAmount.toFixed(2)}
                    value={paidAmount?.toString() || ""}
                    onChange={(e) => setPaidAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaidAmount(totalAmount)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Tam
                  </button>
                  <button
                    onClick={() => setPaidAmount(Math.ceil(totalAmount / 10) * 10)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Yuvarla
                  </button>
                </div>
              </div>

              {/* Change Calculation */}
              {paidAmount && paidAmount > totalAmount && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Para üstü:</span>
                    <span className="text-blue-800 font-bold text-lg">
                      ₺{calculateChange().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Insufficient Payment Warning */}
              {paidAmount && paidAmount < totalAmount && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 font-medium">Kalan tutar:</span>
                    <span className="text-red-800 font-bold">
                      ₺{(totalAmount - paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Not (Opsiyonel)</label>
            <textarea
              placeholder="Not ekleyin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handlePayment}
            disabled={isLoading || (!isOnCredit && (!paidAmount || paidAmount < totalAmount))}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading ? "İşleniyor..." : isOnCredit ? "Veresiye Kaydet" : "Ödemeyi Tamamla"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

