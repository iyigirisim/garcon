"use client";

import React from "react";
import { Table } from "@/types";

interface FloorPlanGridProps {
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
  onCellClick: (x: number, y: number) => void;
  gridWidth?: number;
  gridHeight?: number;
}

const FloorPlanGrid: React.FC<FloorPlanGridProps> = ({
  tables,
  selectedTable,
  onTableSelect,
  onCellClick,
  gridWidth = 12,
  gridHeight = 8,
}) => {
  // Create a map of occupied positions
  const occupiedPositions = new Map<string, Table>();
  tables.forEach((table) => {
    if (table.gridX !== null && table.gridX !== undefined && table.gridY !== null && table.gridY !== undefined) {
      occupiedPositions.set(`${table.gridX}-${table.gridY}`, table);
    }
  });

  const getTableStatus = (table: Table) => {
    if (table.isTakeAway) return "takeaway";
    if (!table.isOpen) return "closed";
    return "open";
  };

  const getTableColor = (table: Table) => {
    const status = getTableStatus(table);
    if (status === "takeaway") return "bg-gray-200 border-gray-400 text-gray-700";
    if (status === "closed") return "bg-gray-100 border-gray-300 text-gray-500";
    return "bg-emerald-50 border-emerald-400 text-emerald-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Floor Plan</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-50 border border-emerald-400 rounded"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Closed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded"></div>
            <span>Take Away</span>
          </div>
        </div>
      </div>

      <div
        className="grid gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
          maxHeight: "calc(100vh - 16rem)",
        }}
      >
        {Array.from({ length: gridHeight }).map((_, y) =>
          Array.from({ length: gridWidth }).map((_, x) => {
            const table = occupiedPositions.get(`${x}-${y}`);
            
            if (table) {
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onTableSelect(table)}
                  className={`aspect-square rounded-lg border-2 p-2 transition-all hover:shadow-md flex flex-col items-center justify-center ${getTableColor(
                    table
                  )} ${
                    selectedTable?.id === table.id
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : ""
                  }`}
                >
                  <div className="text-xs font-bold text-center leading-tight">
                    {table.name}
                  </div>
                  {table.isTakeAway && (
                    <div className="text-[10px] mt-1">📦</div>
                  )}
                </button>
              );
            }

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => onCellClick(x, y)}
                className="aspect-square rounded-lg border border-dashed border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center text-gray-400 hover:text-blue-600"
              >
                <span className="text-lg">+</span>
              </button>
            );
          })
        )}
      </div>

      {/* Unpositioned Tables */}
      {tables.filter((t) => t.gridX === null || t.gridX === undefined || t.gridY === null || t.gridY === undefined).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Unpositioned Tables</h4>
          <div className="flex flex-wrap gap-2">
            {tables
              .filter((t) => t.gridX === null || t.gridX === undefined || t.gridY === null || t.gridY === undefined)
              .map((table) => (
                <button
                  key={table.id}
                  onClick={() => onTableSelect(table)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${getTableColor(
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

export default FloorPlanGrid;






