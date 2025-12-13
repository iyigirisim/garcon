"use client";

import React, { useState } from "react";
import { Room } from "@/types";
import { PencilIcon, TrashIcon } from "lucide-react";

interface RoomSelectorProps {
  rooms: Room[];
  onRoomCreate: (name: string, color: string) => void;
  onRoomUpdate: (
    roomId: string,
    data: { name?: string; color?: string; gridWidth?: number; gridHeight?: number }
  ) => void;
  onRoomDelete: (roomId: string) => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  onRoomCreate,
  onRoomUpdate,
  onRoomDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomColor, setNewRoomColor] = useState("#10b981");
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomColor, setEditRoomColor] = useState("#10b981");

  const handleCreate = () => {
    if (newRoomName.trim()) {
      onRoomCreate(newRoomName, newRoomColor);
      setNewRoomName("");
      setNewRoomColor("#10b981");
      setIsCreating(false);
    }
  };

  const handleEdit = (room: Room) => {
    setIsEditing(room.id);
    setEditRoomName(room.name);
    setEditRoomColor(room.color);
  };

  const handleUpdate = (roomId: string) => {
    if (editRoomName.trim()) {
      onRoomUpdate(roomId, { name: editRoomName, color: editRoomColor });
      setIsEditing(null);
    }
  };

  const handleDelete = (roomId: string) => {
    if (confirm("Bu odayı silmek istediğinize emin misiniz? Tüm masalar atanmamış duruma gelecek.")) {
      onRoomDelete(roomId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Odalar</h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
        >
          {isCreating ? "İptal" : "+ Yeni Oda"}
        </button>
      </div>

      {isCreating && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="Oda adı"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Renk:</label>
            <input
              type="color"
              value={newRoomColor}
              onChange={(e) => setNewRoomColor(e.target.value)}
              className="w-12 h-8 rounded border border-gray-300"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newRoomName.trim()}
            className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            Oda Oluştur
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 pr-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex-shrink-0 relative">
            {isEditing === room.id ? (
              <div className="p-2 bg-gray-50 rounded-lg space-y-2 min-w-[200px]">
                <input
                  type="text"
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editRoomColor}
                    onChange={(e) => setEditRoomColor(e.target.value)}
                    className="w-10 h-6 rounded border border-gray-300"
                  />
                  <button
                    onClick={() => handleUpdate(room.id)}
                    className="px-2 py-1 bg-emerald-600 text-white rounded text-xs"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative pr-2 pt-2.5">
                <div className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="font-medium">{room.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {room.gridWidth}×{room.gridHeight}
                    </span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 flex gap-1 z-20">
                  <button
                    onClick={() => handleEdit(room)}
                    className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 flex items-center justify-center shadow-lg transition-all"
                    title="Edit room"
                  >
                    <PencilIcon className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center shadow-lg transition-all"
                    title="Delete room"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;



