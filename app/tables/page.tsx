"use client";

import React, { useState, useEffect } from "react";
import { Table, Room } from "@/types";
import RoomSelector from "@/components/tables/RoomSelector";
import MultiRoomLayout from "@/components/tables/MultiRoomLayout";
import TableEditor from "@/components/tables/TableEditor";
import ManagementPanel from "@/components/tables/ManagementPanel";
import AddOrderModal from "@/components/tables/AddOrderModal";
import PaymentModal from "@/components/tables/PaymentModal";
import EndOfDayModal from "@/components/tables/EndOfDayModal";
import { getAllRooms, createRoom, updateRoom, deleteRoom, optimizeRoomGrid } from "@/actions/room";
import { getAllTables, createTable, updateTable, deleteTable, getActiveSalesByTable, reopenTable } from "@/actions/table";

export default function TablesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isEndOfDay, setIsEndOfDay] = useState(false);
  const [hasActiveSales, setHasActiveSales] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tablesWithActiveSales, setTablesWithActiveSales] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTable && selectedTable.isOpen) {
      checkActiveSales();
    } else {
      setHasActiveSales(false);
    }
  }, [selectedTable]);

  const updateActiveSalesStatus = async (tablesToCheck?: Table[]) => {
    const tablesToProcess = tablesToCheck || tables;
    const activeSalesMap = new Set<string>();
    
    for (const table of tablesToProcess) {
      if (table.isOpen) {
        try {
          const sales = await getActiveSalesByTable(table.id);
          if (sales.length > 0) {
            activeSalesMap.add(table.id);
          }
        } catch (error) {
          console.error(`Failed to check active sales for table ${table.id}:`, error);
        }
      }
    }
    setTablesWithActiveSales(activeSalesMap);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allRooms, allTables] = await Promise.all([getAllRooms(), getAllTables()]);
      setRooms(allRooms as Room[]);
      setTables(allTables as Table[]);
      
      // Check active sales for all tables
      await updateActiveSalesStatus(allTables as Table[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveSales = async (tableId?: string) => {
    const tableIdToCheck = tableId || selectedTable?.id;
    if (!tableIdToCheck) return;
    try {
      const sales = await getActiveSalesByTable(tableIdToCheck);
      setHasActiveSales(sales.length > 0);
    } catch (error) {
      console.error("Failed to check active sales:", error);
      setHasActiveSales(false);
    }
  };

  const handleRoomCreate = async (name: string, color: string) => {
    try {
      const newRoom = await createRoom(name, color, rooms.length, 3, 3);
      setRooms([...rooms, newRoom as Room]);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Oda oluşturulamadı");
    }
  };

  const handleRoomUpdate = async (
    roomId: string,
    data: { name?: string; color?: string; gridWidth?: number; gridHeight?: number }
  ) => {
    try {
      const updatedRoom = await updateRoom(roomId, data);
      setRooms(rooms.map((r) => (r.id === roomId ? (updatedRoom as Room) : r)));
    } catch (error) {
      console.error("Failed to update room:", error);
      alert("Oda güncellenemedi");
    }
  };

  const handleRoomDelete = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
      loadData(); // Reload to update unassigned tables
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Oda silinemedi");
    }
  };

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCellClick = async (roomId: string, x: number, y: number) => {
    const name = prompt("Masa adını girin:");
    if (!name) return;

    try {
      const newTable = await createTable(name, undefined, roomId, x, y, false);
      setTables([...tables, newTable as Table]);
    } catch (error) {
      console.error("Failed to create table:", error);
      alert("Masa oluşturulamadı");
    }
  };

  const handleRoomGridUpdate = async (roomId: string, gridWidth: number, gridHeight: number) => {
    // Optimize grid size: remove empty rows/columns while keeping 3x3 minimum
    const optimized = await optimizeRoomGrid(roomId, gridWidth, gridHeight);
    await handleRoomUpdate(roomId, { gridWidth: optimized.width, gridHeight: optimized.height });
  };

  const handleTableUpdate = async (tableId: string, data: Partial<Table>) => {
    try {
      const tableToUpdate = tables.find((t) => t.id === tableId);
      const updatedTable = await updateTable(tableId, data);
      setTables(tables.map((t) => (t.id === tableId ? (updatedTable as Table) : t)));
      if (selectedTable?.id === tableId) {
        setSelectedTable(updatedTable as Table);
      }

      // Optimize grid if position changed
      const roomId = data.roomId || tableToUpdate?.roomId;
      if (roomId && (data.gridX !== undefined || data.gridY !== undefined)) {
        const allRooms = await getAllRooms();
        const room = allRooms.find((r) => r.id === roomId);
        if (room) {
          const optimized = await optimizeRoomGrid(roomId, room.gridWidth, room.gridHeight);
          if (optimized.width !== room.gridWidth || optimized.height !== room.gridHeight) {
            await handleRoomUpdate(roomId, { 
              gridWidth: optimized.width, 
              gridHeight: optimized.height 
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to update table:", error);
      alert("Masa güncellenemedi");
    }
  };

  const handleTableReopen = async (tableId: string) => {
    try {
      await reopenTable(tableId);
      // Update tables data without full reload
      const updatedTables = await getAllTables();
      setTables(updatedTables as Table[]);
      // Update active sales status
      await updateActiveSalesStatus(updatedTables as Table[]);
      // Update selected table if it's the one being reopened
      if (selectedTable?.id === tableId) {
        const updatedTable = updatedTables.find((t) => t.id === tableId);
        if (updatedTable) {
          setSelectedTable(updatedTable as Table);
          await checkActiveSales(tableId);
        }
      }
    } catch (error) {
      console.error("Failed to reopen table:", error);
      alert("Masa açılamadı. Lütfen tekrar deneyin.");
    }
  };

  const handleTableDelete = async (tableId: string) => {
    try {
      const tableToDelete = tables.find((t) => t.id === tableId);
      if (!tableToDelete) return;

      const roomId = tableToDelete.roomId;
      const hadPosition = tableToDelete.gridX !== null && tableToDelete.gridY !== null;

      await deleteTable(tableId);
      
      // Update local state immediately
      setTables(tables.filter((t) => t.id !== tableId));
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }

      // Optimize grid after deletion if table had a position
      if (roomId && hadPosition) {
        // Get fresh room data
        const allRooms = await getAllRooms();
        const room = allRooms.find((r) => r.id === roomId);
        if (room) {
          const optimized = await optimizeRoomGrid(roomId, room.gridWidth, room.gridHeight);
          if (optimized.width !== room.gridWidth || optimized.height !== room.gridHeight) {
            await handleRoomUpdate(roomId, { 
              gridWidth: optimized.width, 
              gridHeight: optimized.height 
            });
          }
        }
      }

      // Reload data to reflect all changes
      await loadData();
    } catch (error) {
      console.error("Failed to delete table:", error);
      alert("Masa silinemedi");
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Masa Yönetimi</h1>
          <p className="text-gray-600">Restoran yerleşim planınızı ve siparişlerinizi yönetin</p>
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Left Column - Floor Plan (70%) */}
          <div className="w-2/3 space-y-4">
            <RoomSelector
              rooms={rooms}
              onRoomCreate={handleRoomCreate}
              onRoomUpdate={handleRoomUpdate}
              onRoomDelete={handleRoomDelete}
            />

            <MultiRoomLayout
              rooms={rooms}
              tables={tables}
              selectedTable={selectedTable}
              onTableSelect={handleTableSelect}
              onCellClick={handleCellClick}
              onRoomGridUpdate={handleRoomGridUpdate}
              tablesWithActiveSales={tablesWithActiveSales}
            />


          </div>

          {/* Right Column - Management Panel (30%) */}
          <div className="lg:col-span-1">
            <ManagementPanel
              selectedTable={selectedTable}
              onAddOrder={() => setIsAddingOrder(true)}
              onPayment={() => setIsProcessingPayment(true)}
              onEndOfDay={() => setIsEndOfDay(true)}
              onDelete={handleTableDelete}
              onEdit={() => setIsEditingTable(true)}
              hasActiveSales={hasActiveSales}
              onDeselect={() => setSelectedTable(null)}
              onReopenTable={handleTableReopen}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditingTable && (
        <TableEditor
          table={selectedTable}
          rooms={rooms}
          onUpdate={handleTableUpdate}
          onDelete={handleTableDelete}
          onClose={() => setIsEditingTable(false)}
        />
      )}

      {isAddingOrder && (
        <AddOrderModal
          table={selectedTable}
          onClose={() => setIsAddingOrder(false)}
          onSuccess={async () => {
            await checkActiveSales();
            // Update tables data without full reload
            const updatedTables = await getAllTables();
            setTables(updatedTables as Table[]);
            // Update active sales status for all tables
            await updateActiveSalesStatus(updatedTables as Table[]);
          }}
        />
      )}

      {isProcessingPayment && (
        <PaymentModal
          table={selectedTable}
          onClose={() => setIsProcessingPayment(false)}
          onSuccess={async () => {
            // Update tables data without full reload
            const updatedTables = await getAllTables();
            setTables(updatedTables as Table[]);
            // Update active sales status for all tables
            await updateActiveSalesStatus(updatedTables as Table[]);
            // Keep the table selected and update it with fresh data
            if (selectedTable) {
              const updatedTable = updatedTables.find((t) => t.id === selectedTable.id);
              if (updatedTable) {
                setSelectedTable(updatedTable as Table);
                // Check active sales after payment using the table ID
                await checkActiveSales(updatedTable.id);
              }
            }
          }}
        />
      )}

      {isEndOfDay && (
        <EndOfDayModal
          onClose={() => setIsEndOfDay(false)}
          onSuccess={() => {
            setSelectedTable(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}



