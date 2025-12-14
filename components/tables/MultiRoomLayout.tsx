"use client";

import React from "react";
import { Room, Table } from "@/types";
import RoomGrid from "./RoomGrid";
import TakeAwaySection from "./TakeAwaySection";

interface MultiRoomLayoutProps {
  rooms: Room[];
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
  onCellClick: (roomId: string, x: number, y: number) => void;
  onRoomGridUpdate?: (roomId: string, gridWidth: number, gridHeight: number) => void;
  tablesWithActiveSales?: Set<string>;
}

const MultiRoomLayout: React.FC<MultiRoomLayoutProps> = ({
  rooms,
  tables,
  selectedTable,
  onTableSelect,
  onCellClick,
  onRoomGridUpdate,
  tablesWithActiveSales = new Set(),
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Take Away Section - Left Side */}
      <div className="w-full lg:w-1/3">
        <TakeAwaySection
          tables={tables}
          selectedTable={selectedTable}
          onTableSelect={onTableSelect}
          tablesWithActiveSales={tablesWithActiveSales}
        />
      </div>

      {/* Rooms Grid Area - Right Side */}
      <div className="w-full lg:flex-1">
        {rooms.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Mevcut oda yok</p>
            <p className="text-sm mt-2">Başlamak için bir oda oluşturun</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-1 rounded-lg shadow-sm w-fit"
                style={{ 
                  minWidth: `calc(${room.gridWidth} * (60px + 0.5rem) + 30px + 2.25rem)`
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <h4 className="font-semibold text-gray-800">
                    {room.name}
                  </h4>
                </div>
                <RoomGrid
                  room={room}
                  tables={tables}
                  selectedTable={selectedTable}
                  onTableSelect={onTableSelect}
                  onCellClick={onCellClick}
                  onRoomGridUpdate={onRoomGridUpdate}
                  tablesWithActiveSales={tablesWithActiveSales}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiRoomLayout;

