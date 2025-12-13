"use client";

import React, { useState, useEffect } from "react";
import { Table, Room } from "@/types";
import { X } from "lucide-react";

interface TableEditorProps {
  table: Table | null;
  rooms: Room[];
  onUpdate: (tableId: string, data: Partial<Table>) => void;
  onDelete: (tableId: string) => void;
  onClose: () => void;
}

const TableEditor: React.FC<TableEditorProps> = ({
  table,
  rooms,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState<string>("");
  const [gridX, setGridX] = useState<number | undefined>();
  const [gridY, setGridY] = useState<number | undefined>();
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (table) {
      setName(table.name);
      setRoomId(table.roomId || "");
      setGridX(table.gridX ?? undefined);
      setGridY(table.gridY ?? undefined);
      setCustomerName(table.customerName || "");
    }
  }, [table]);

  if (!table) return null;

  const handleSave = () => {
    onUpdate(table.id, {
      name,
      roomId: roomId || undefined,
      gridX: gridX ?? null,
      gridY: gridY ?? null,
      customerName: customerName || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (table.isTakeAway) {
      alert("Paket servis masası silinemez");
      return;
    }
    if (confirm("Bu masayı silmek istediğinize emin misiniz?")) {
      onDelete(table.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Masayı Düzenle</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={table.isTakeAway}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oda
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Oda Yok</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid X
              </label>
              <input
                type="number"
                value={gridX ?? ""}
                onChange={(e) => setGridX(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="X pozisyonu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Y
              </label>
              <input
                type="number"
                value={gridY ?? ""}
                onChange={(e) => setGridY(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Y pozisyonu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri Adı (Opsiyonel)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {table.isTakeAway && (
            <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
              Bu özel paket servis masasıdır. Adı değiştirilemez ve masa silinemez.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Değişiklikleri Kaydet
          </button>
          {!table.isTakeAway && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sil
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableEditor;



