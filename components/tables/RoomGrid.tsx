"use client";

import React from "react";
import { Table, Room } from "@/types";
import { X } from "lucide-react";

interface RoomGridProps {
  room: Room;
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
  onTableDelete: (tableId: string) => void;
  onCellClick: (roomId: string, x: number, y: number) => void;
  onRoomGridUpdate?: (roomId: string, gridWidth: number, gridHeight: number) => void;
  tablesWithActiveSales?: Set<string>;
}

const RoomGrid: React.FC<RoomGridProps> = ({
  room,
  tables,
  selectedTable,
  onTableSelect,
  onTableDelete,
  onCellClick,
  onRoomGridUpdate,
  tablesWithActiveSales = new Set(),
}) => {
  const [hoveredColumn, setHoveredColumn] = React.useState<boolean>(false);
  const [hoveredRow, setHoveredRow] = React.useState<boolean>(false);
  // Filter tables for this room (exclude take away)
  const roomTables = tables.filter(
    (t) => t.roomId === room.id && !t.isTakeAway
  );

  // Create a map of occupied positions
  const occupiedPositions = new Map<string, Table>();
  roomTables.forEach((table) => {
    if (
      table.gridX !== null &&
      table.gridX !== undefined &&
      table.gridY !== null &&
      table.gridY !== undefined
    ) {
      occupiedPositions.set(`${table.gridX}-${table.gridY}`, table);
    }
  });

  const getTableStatus = (table: Table) => {
    if (!table.isOpen) return "closed";
    return "open";
  };

  const getTableColor = (table: Table) => {
    const status = getTableStatus(table);
    if (status === "closed")
      return "bg-gray-100 border-gray-300 text-gray-500";
    // If table has active sales (unpaid orders), use orange color
    if (tablesWithActiveSales.has(table.id)) {
      return "bg-orange-50 border-orange-400 text-orange-800";
    }
    // If table is open but has no active sales, use green color
    return "bg-emerald-50 border-emerald-400 text-emerald-800";
  };

  const displayWidth = hoveredColumn ? room.gridWidth + 1 : room.gridWidth;
  const displayHeight = hoveredRow ? room.gridHeight + 1 : room.gridHeight;

  const handleCellClick = (x: number, y: number) => {
    // Check if we need to expand the grid
    let newWidth = room.gridWidth;
    let newHeight = room.gridHeight;
    
    if (x >= room.gridWidth) {
      newWidth = x + 1;
    }
    if (y >= room.gridHeight) {
      newHeight = y + 1;
    }

    // Update grid if needed
    if ((newWidth !== room.gridWidth || newHeight !== room.gridHeight) && onRoomGridUpdate) {
      onRoomGridUpdate(room.id, newWidth, newHeight);
    }

    onCellClick(room.id, x, y);
  };

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg border-2 relative"
        style={{
          width: hoveredColumn 
            ? `calc(${room.gridWidth} * (60px + 0.5rem) + 30px + 0.5rem + 1rem + 8px)`
            : `calc(${room.gridWidth} * (60px + 0.5rem) + 1rem + 4px)`,
          borderColor: room.color,
        }}
        onMouseLeave={() => {
          setHoveredColumn(false);
          setHoveredRow(false);
        }}
      >
        {Array.from({ length: displayHeight }).map((_, y) =>
          Array.from({ length: displayWidth }).map((_, x) => {
            const isNewColumn = hoveredColumn && x === room.gridWidth;
            const isNewRow = hoveredRow && y === room.gridHeight;
            const isHoveredCell = isNewColumn || isNewRow;
            const isOutsideGrid = x >= room.gridWidth || y >= room.gridHeight;

            const table = !isOutsideGrid ? occupiedPositions.get(`${x}-${y}`) : null;

            if (table) {
              return (
                <div key={`${x}-${y}`} className="relative group">
                  <button
                    onClick={() => onTableSelect(table)}
                    className={`w-[60px] aspect-square rounded-lg border-2 p-2 transition-all hover:shadow-md hover:bg-blue-50 flex flex-col items-center justify-center ${getTableColor(
                      table
                    )} ${
                      selectedTable?.id === table.id
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }`}
                    onMouseEnter={() => {
                      // Show new column when hovering over the rightmost column
                      if (x === room.gridWidth - 1) {
                        setHoveredColumn(true);
                      }
                      // Show new row when hovering over the bottommost row
                      if (y === room.gridHeight - 1) {
                        setHoveredRow(true);
                      }
                    }}
                  >
                    <div className="text-xs font-bold text-center leading-tight">
                      {table.name}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`"${table.name}" masasını silmek istediğinize emin misiniz?`)) {
                        onTableDelete(table.id);
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10 shadow-sm hover:bg-red-600 scale-75 hover:scale-100"
                    title="Masayı Sil"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            }

            const isGhostColumn = x === room.gridWidth;
            const isGhostRow = y === room.gridHeight;
            
            let sizeClasses = "w-[60px] h-[60px]"; // Default
            if (isGhostColumn) sizeClasses = "w-[30px] h-[60px]";
            if (isGhostRow) sizeClasses = "w-[60px] h-[30px]";
            if (isGhostColumn && isGhostRow) sizeClasses = "w-[30px] h-[30px]";

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={`${sizeClasses} rounded-lg border transition-all flex items-center justify-center ${
                  isHoveredCell
                    ? "border-dashed border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-200 hover:border-blue-400 hover:text-blue-600"
                    : isOutsideGrid
                    ? "border-dashed border-gray-200 bg-gray-50 text-gray-300 opacity-40"
                    : "border-dashed border-gray-300 bg-white hover:bg-blue-100 hover:border-blue-400 text-gray-400 hover:text-blue-600"
                }`}
                onMouseEnter={() => {
                  // Show new column when hovering over the rightmost column or the new column
                  if (x === room.gridWidth - 1 || x === room.gridWidth) {
                    setHoveredColumn(true);
                  }
                  // Show new row when hovering over the bottommost row or the new row
                  if (y === room.gridHeight - 1 || y === room.gridHeight) {
                    setHoveredRow(true);
                  }
                }}
              >
                <span className="text-lg">+</span>
              </button>
            );
          })
        )}
      </div>

      {/* Unpositioned Tables for this room */}
      {roomTables.filter(
        (t) =>
          t.gridX === null ||
          t.gridX === undefined ||
          t.gridY === null ||
          t.gridY === undefined
      ).length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-gray-600">
            Konumlandırılmamış Masalar
          </h5>
          <div className="flex flex-wrap gap-1">
            {roomTables
              .filter(
                (t) =>
                  t.gridX === null ||
                  t.gridX === undefined ||
                  t.gridY === null ||
                  t.gridY === undefined
              )
              .map((table) => (
                <button
                  key={table.id}
                  onClick={() => onTableSelect(table)}
                  className={`px-2 py-1 rounded-lg border-2 text-xs transition-colors ${getTableColor(
                    table
                  )} ${
                    selectedTable?.id === table.id
                      ? "ring-2 ring-blue-500 ring-offset-1"
                      : ""
                  }`}
                >
                  {table.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomGrid;

