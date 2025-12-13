"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/types";
import { getAllTables, createTable } from "@/actions/table";
import { useTableSalesCache } from "@/hooks/useTableSalesCache";
import dayjs from "dayjs";

interface TableWithSales extends Table {
  hasActiveSales?: boolean;
  activeItemsCount?: number;
  currentTotal?: number;
}

interface TableSelectorProps {
  selectedTable: Table | null;
  onTableSelect: (table: Table, hasActiveSales?: boolean) => void;
  initialTables?: Table[];
}

const TableSelector: React.FC<TableSelectorProps> = ({
  selectedTable,
  onTableSelect,
  initialTables = []
}) => {
  const [tables, setTables] = useState<TableWithSales[]>(initialTables);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { getTableSales, getCachedSales, isCached } = useTableSalesCache();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const allTables = await getAllTables();
      const tablesWithSales: TableWithSales[] = [];
      
      for (const table of allTables) {
        const convertedTable: TableWithSales = {
          ...table,
        };

        if (table.isOpen) {
          try {
            // Check cache first
            const cached = getCachedSales(table.id);
            if (cached) {
              convertedTable.hasActiveSales = cached.combinedSaleItems.length > 0;
              convertedTable.activeItemsCount = cached.totalItems;
              convertedTable.currentTotal = cached.totalAmount;
            } else {
              // Load in background without blocking UI
              getTableSales(table.id).then(salesData => {
                const hasActiveSales = salesData.combinedSaleItems.length > 0;
                if (hasActiveSales) {
                  setTables(prev => prev.map(t => 
                    t.id === table.id 
                      ? { 
                          ...t, 
                          hasActiveSales: true,
                          activeItemsCount: salesData.totalItems,
                          currentTotal: salesData.totalAmount
                        }
                      : t
                  ));
                }
              }).catch(error => {
                console.error(`Failed to load sales for table ${table.id}:`, error);
              });
            }
          } catch (error) {
            console.error(`Failed to load sales for table ${table.id}:`, error);
            convertedTable.hasActiveSales = false;
            convertedTable.activeItemsCount = 0;
            convertedTable.currentTotal = 0;
          }
        }
        
        tablesWithSales.push(convertedTable);
      }
      
      setTables(tablesWithSales);
    } catch (error) {
      console.error("Failed to load tables:", error);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;

    setIsLoading(true);
          try {
        const createdTable = await createTable(newTableName, newCustomerName || undefined, undefined, undefined, undefined, false);
        const newTable = {
          ...createdTable,
        };
        setTables(prev => [newTable, ...prev]);
        onTableSelect(newTable, false);
        setNewTableName("");
        setNewCustomerName("");
        setShowCreateForm(false);
      } catch (error) {
        console.error("Failed to create table:", error);
      }
    setIsLoading(false);
  };

  const activeTables = tables.filter(table => table.isOpen);
  const closedTables = tables.filter(table => !table.isOpen);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Select Table</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "New Table"}
        </button>
      </div>

      {showCreateForm && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Table name"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Customer name (optional)"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateTable}
            disabled={!newTableName.trim() || isLoading}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? "Creating..." : "Create Table"}
          </button>
        </div>
      )}

      {/* Active Tables */}
      {activeTables.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Active Tables</h4>
          <div className="grid grid-cols-2 gap-2">
            {activeTables.map((table) => (
              <button
                key={table.id}
                onClick={() => onTableSelect(table, table.hasActiveSales)}
                className={`p-3 rounded-lg border-2 text-left transition-colors relative ${
                  selectedTable?.id === table.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : table.hasActiveSales
                      ? "border-orange-400 bg-orange-50 hover:border-orange-500"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {/* Active sales indicator */}
                {table.hasActiveSales && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                )}
                
                <div className="font-medium">{table.name}</div>
                {table.customerName && (
                  <div className="text-sm text-gray-600">{table.customerName}</div>
                )}
                
                {/* Show active sales info */}
                {table.hasActiveSales && (
                  <div className="text-xs text-orange-600 font-medium">
                    {table.activeItemsCount} items • ₺{table.currentTotal?.toFixed(2)}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Opened: {dayjs(table.openedAt).format("HH:mm")}
                  {dayjs(table.openedAt).isSame(dayjs(), 'day') ? ", Today" : 
                      dayjs(table.openedAt).isSame(dayjs().subtract(1, 'day'), 'day') ? 
                        ", Yesterday" : dayjs(table.openedAt).format(", DD MMM")}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Closed Tables */}
      {closedTables.length > 0 && (
        <details className="space-y-2">
          <summary className="text-md font-medium text-gray-700 cursor-pointer">
            Recent Closed Tables ({closedTables.length})
          </summary>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {closedTables.slice(0, 6).map((table) => (
              <button
                key={table.id}
                onClick={() => onTableSelect(table, false)}
                className={`p-3 rounded-lg border-2 text-left transition-colors opacity-60 ${
                  selectedTable?.id === table.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <div className="font-medium">{table.name}</div>
                {table.customerName && (
                  <div className="text-sm text-gray-600">{table.customerName}</div>
                )}
                <div className="text-xs text-gray-500">
                  Closed: {table.closedAt ? dayjs(table.closedAt).format("HH:mm, DD MMM") : "N/A"}
                </div>
              </button>
            ))}
          </div>
        </details>
      )}

      {tables.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No tables available. Create a new table to get started.
        </div>
      )}
    </div>
  );
};

export default TableSelector; 