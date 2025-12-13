"use client";

import React from "react";
import { Table } from "@/types";

interface TakeAwaySectionProps {
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
  tablesWithActiveSales?: Set<string>;
}

const TakeAwaySection: React.FC<TakeAwaySectionProps> = ({
  tables,
  selectedTable,
  onTableSelect,
  tablesWithActiveSales = new Set(),
}) => {
  const takeAwayTables = tables.filter((t) => t.isTakeAway);

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
    // If table is open but has no active sales, use gray color (take away default)
    return "bg-gray-200 border-gray-400 text-gray-700";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Paket Servis</h3>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded"></div>
          <span className="text-xs text-gray-600">Paket Servis</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 min-h-[200px]">
        {takeAwayTables.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">📦</div>
            <p className="text-sm">Paket servis masası yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {takeAwayTables.map((table) => (
              <button
                key={table.id}
                onClick={() => onTableSelect(table)}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${getTableColor(
                  table
                )} ${
                  selectedTable?.id === table.id
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <span className="font-semibold">{table.name}</span>
                  </div>
                  <div className="text-xs">
                    {table.isOpen ? (
                      <span className="text-emerald-600">Açık</span>
                    ) : (
                      <span className="text-gray-500">Kapalı</span>
                    )}
                  </div>
                </div>
                {table.customerName && (
                  <div className="text-xs text-gray-600 mt-1">
                    Müşteri: {table.customerName}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeAwaySection;

