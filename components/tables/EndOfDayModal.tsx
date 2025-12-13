"use client";

import React, { useState, useEffect } from "react";
import { PaymentType } from "@/types";
import dayjs from "dayjs";
import { 
  X, 
  Banknote, 
  CreditCard, 
  Ticket, 
  Coins, 
  AlertTriangle 
} from "lucide-react";

interface EndOfDayModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface DaySummary {
  totalCash: number;
  totalCard: number;
  totalFoodTicket: number;
  totalOther: number;
  totalSales: number;
  salesCount: number;
}

const EndOfDayModal: React.FC<EndOfDayModalProps> = ({ onClose, onSuccess }) => {
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    calculateDaySummary();
  }, []);

  const calculateDaySummary = async () => {
    setIsCalculating(true);
    try {
      // Fetch today's sales from 9 AM onwards
      const todayStart = dayjs().startOf("day").add(9, "hour").toISOString();
      const tomorrowStart = dayjs().add(1, "day").startOf("day").add(9, "hour").toISOString();

      const response = await fetch(`/api/sales?paidAfter=${todayStart}&paidBefore=${tomorrowStart}`);
      
      if (!response.ok) {
        // If the API doesn't exist, calculate manually
        // This is a fallback - we'll calculate based on mock data or leave it to the server
        setSummary({
          totalCash: 0,
          totalCard: 0,
          totalFoodTicket: 0,
          totalOther: 0,
          totalSales: 0,
          salesCount: 0,
        });
        return;
      }

      const sales = await response.json();

      const totalCash = sales
        .filter((s: any) => s.paymentType === PaymentType.CASH && s.isPaid)
        .reduce((sum: number, s: any) => sum + (s.paidAmount || s.total), 0);

      const totalCard = sales
        .filter((s: any) => s.paymentType === PaymentType.CARD && s.isPaid)
        .reduce((sum: number, s: any) => sum + (s.paidAmount || s.total), 0);

      const totalFoodTicket = sales
        .filter((s: any) => s.paymentType === PaymentType.FOOD_TICKET && s.isPaid)
        .reduce((sum: number, s: any) => sum + (s.paidAmount || s.total), 0);

      const totalOther = sales
        .filter((s: any) => s.paymentType === PaymentType.OTHER && s.isPaid)
        .reduce((sum: number, s: any) => sum + (s.paidAmount || s.total), 0);

      const totalSales = totalCash + totalCard + totalFoodTicket + totalOther;
      const salesCount = sales.filter((s: any) => s.isPaid).length;

      setSummary({
        totalCash,
        totalCard,
        totalFoodTicket,
        totalOther,
        totalSales,
        salesCount,
      });
    } catch (error) {
      console.error("Failed to calculate day summary:", error);
      // Set default values in case of error
      setSummary({
        totalCash: 0,
        totalCard: 0,
        totalFoodTicket: 0,
        totalOther: 0,
        totalSales: 0,
        salesCount: 0,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleEndOfDay = async () => {
    if (!summary) return;

    if (
      !confirm(
        "Günü bitirmek istediğinize emin misiniz? Bu işlem:\n\n" +
          "- Tüm açık masaları kapatacak\n" +
          "- Günlük rapor oluşturacak\n" +
          "- Bugünün verilerini arşivleyecek\n\n" +
          "Bu işlem geri alınamaz."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/daily-report/end-of-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create end of day report");
      }

      const report = await response.json();
      alert(`Gün sonu raporu başarıyla oluşturuldu!\n\nToplam Satış: ₺${report.totalSales.toFixed(2)}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to end day:", error);
      alert("Gün sonu işlemi başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Gün Sonu Raporu</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {dayjs().format("dddd, MMMM D, YYYY")}
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isCalculating ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Bugünün özeti hesaplanıyor...</div>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* Sales Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-800 mb-3">Toplam Satış</h4>
                <div className="text-3xl font-bold text-emerald-600">
                  ₺{summary.totalSales.toFixed(2)}
                </div>
                <div className="text-sm text-emerald-700 mt-1">
                  {summary.salesCount} işlem
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800 mb-3">Ödeme Dağılımı</h4>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-700">Nakit</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₺{summary.totalCash.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-700">Kart</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₺{summary.totalCard.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-700">Yemek Çeki</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₺{summary.totalFoodTicket.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-700">Diğer</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₺{summary.totalOther.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span>Önemli</span>
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Tüm açık masalar kapatılacak</li>
                  <li>Günlük rapor oluşturulacak ve arşivlenecek</li>
                  <li>Yarın yeni bir gün başlatabilirsiniz</li>
                  <li>Bu işlem geri alınamaz</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              Özet yüklenemedi. Lütfen tekrar deneyin.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleEndOfDay}
            disabled={isLoading || isCalculating || !summary}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading ? "İşleniyor..." : "Günü Bitir ve Arşivle"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndOfDayModal;



