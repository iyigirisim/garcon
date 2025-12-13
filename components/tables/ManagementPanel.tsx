"use client";

import React from "react";
import { Table } from "@/types";
import { 
  Plus, 
  CreditCard, 
  Pencil, 
  Trash2, 
  LockOpen, 
  Moon, 
  X 
} from "lucide-react";

interface ManagementPanelProps {
  selectedTable: Table | null;
  onAddOrder: () => void;
  onPayment: () => void;
  onEndOfDay: () => void;
  onDelete?: (tableId: string) => void;
  onEdit?: () => void;
  hasActiveSales?: boolean;
  onDeselect?: () => void;
  onReopenTable?: (tableId: string) => void;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({
  selectedTable,
  onAddOrder,
  onPayment,
  onEndOfDay,
  onDelete,
  onEdit,
  hasActiveSales,
  onDeselect,
  onReopenTable,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Yönetim</h3>
        {selectedTable && onDeselect && (
          <button
            onClick={onDeselect}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
            title="Seçimi İptal Et"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {selectedTable ? (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Seçili Masa</div>
            <div className="font-semibold text-gray-800">{selectedTable.name}</div>
            {selectedTable.customerName && (
              <div className="text-sm text-gray-600">{selectedTable.customerName}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Durum: {selectedTable.isOpen ? "Açık" : "Kapalı"}
              {selectedTable.isTakeAway && " • Paket Servis"}
            </div>
          </div>

          <button
            onClick={onAddOrder}
            disabled={!selectedTable.isOpen}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Sipariş Ekle</span>
          </button>

          <button
            onClick={onPayment}
            disabled={!selectedTable.isOpen || !hasActiveSales}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Ödeme Al</span>
          </button>

          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Pencil className="w-5 h-5" />
              <span>Seçili Masayı Düzenle</span>
            </button>
          )}

          {onDelete && !selectedTable.isTakeAway && (
            <button
              onClick={() => {
                if (confirm(`"${selectedTable.name}" masasını silmek istediğinize emin misiniz?`)) {
                  onDelete(selectedTable.id);
                }
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Masayı Sil</span>
            </button>
          )}

          {!selectedTable.isOpen && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 text-center">
                Masa kapalı. Sipariş eklemek veya ödeme almak için masayı açın.
              </div>
              {onReopenTable && (
                <button
                  onClick={() => {
                    if (confirm(`"${selectedTable.name}" masasını açmak istediğinize emin misiniz?`)) {
                      onReopenTable(selectedTable.id);
                    }
                  }}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <LockOpen className="w-5 h-5" />
                  <span>Masayı Aç</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          Sipariş ve ödemeleri yönetmek için bir masa seçin
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <button
          onClick={onEndOfDay}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Moon className="w-5 h-5" />
          <span>Gün Sonu</span>
        </button>
        <div className="text-xs text-gray-500 text-center mt-2">
          Tüm masaları kapat ve günlük rapor oluştur
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel;



