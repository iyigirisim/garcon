import React, { useEffect, useState } from "react";
import { Table, Sale } from "@/types";
import { getActiveSalesByTable, removeItemFromSale } from "@/actions/table";
import { 
  Plus, 
  CreditCard, 
  Pencil, 
  Trash2, 
  LockOpen, 
  Moon, 
  X,
  ShoppingBag
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
  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const [isLoadingSale, setIsLoadingSale] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveSale = async () => {
      if (selectedTable && selectedTable.isOpen) {
        setIsLoadingSale(true);
        try {
          const sales = await getActiveSalesByTable(selectedTable.id);
          if (isMounted) {
            setActiveSale(sales.length > 0 ? (sales[0] as unknown as Sale) : null);
          }
        } catch (error) {
          console.error("Failed to fetch active sale:", error);
        } finally {
          if (isMounted) {
            setIsLoadingSale(false);
          }
        }
      } else {
        setActiveSale(null);
      }
    };

    fetchActiveSale();

    return () => {
      isMounted = false;
    };
  }, [selectedTable, hasActiveSales]); // Re-fetch when table or hasActiveSales changes

  const handleRemoveItem = async (saleId: string, itemId: string, itemName: string) => {
    if (!confirm(`${itemName} ürününü siparişten silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const updatedSale = await removeItemFromSale(saleId, itemId);
      setActiveSale(updatedSale as unknown as Sale); // Type assertion if needed based on return type
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Ürün silinemedi.");
    }
  };

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
            
            {/* Active Order Items */}
            {selectedTable.isOpen && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-medium">Siparişler</span>
                </div>
                
                {isLoadingSale ? (
                  <div className="text-xs text-gray-500 py-2">Yükleniyor...</div>
                ) : activeSale && activeSale.saleItems && activeSale.saleItems.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {activeSale.saleItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1 group">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.quantity}
                          </span>
                          <span className="text-gray-700">{item.product?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">
                            {(item.unitPrice * item.quantity).toFixed(2)} ₺
                          </span>
                          <button
                            onClick={() => handleRemoveItem(activeSale.id, item.id, item.product?.name || "Ürün")}
                            className="text-gray-400 hover:text-red-600 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center font-bold text-gray-800">
                      <span>Toplam</span>
                      <span>{activeSale.total.toFixed(2)} ₺</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">Henüz sipariş yok</div>
                )}
              </div>
            )}
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



