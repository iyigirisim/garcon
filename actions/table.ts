"use server";

import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";

// const getStoredTables = (): Record<string, Table[]> => {
//   const storedData = localStorage.getItem(TABLES_STORAGE_KEY);
//   return storedData ? JSON.parse(storedData) : {};
// };

// const getStoredSales = (): Record<string, Sale[]> => {
//   const storedData = localStorage.getItem(SALES_STORAGE_KEY);
//   return storedData ? JSON.parse(storedData) : {};
// };

// const saveTables = (tables: Table[]) => {
//   const today = getTodayDate();
//   const storedData = getStoredTables();
//   storedData[today] = tables;
//   localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(storedData));
// };

// const saveSales = (sales: Sale[]) => {
//   const today = getTodayDate();
//   const storedData = getStoredSales();
//   storedData[today] = sales;
//   localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(storedData));
// };

// export const closeTable = (tableId: string): Table | null => {
//   const tables = getAllTables();
//   const tableIndex = tables.findIndex((t) => t.id === tableId);

//   if (tableIndex === -1) return null;

//   tables[tableIndex].isOpen = false;
//   tables[tableIndex].closedAt = dayjs().toDate();
//   saveTables(tables);
//   return tables[tableIndex];
// };

// export const reopenTable = (tableId: string): Table | null => {
//   const tables = getAllTables();
//   const tableIndex = tables.findIndex((t) => t.id === tableId);

//   if (tableIndex === -1) return null;

//   tables[tableIndex].isOpen = true;
//   tables[tableIndex].closedAt = undefined;
//   saveTables(tables);
//   return tables[tableIndex];
// };

export const createTable = async (
  name: string,
  customerName?: string,
  roomId?: string,
  gridX?: number,
  gridY?: number,
  isTakeAway?: boolean
) => {
  return await prisma.table.create({
    data: {
      name,
      openedAt: dayjs().toDate(),
      isOpen: true,
      customerName,
      roomId,
      gridX,
      gridY,
      isTakeAway: isTakeAway || false,
    },
  });
};

export const getTable = async (tableId: string) => {
  return await prisma.table.findUnique({
    where: { id: tableId },
  });
};

// Helper function to initialize tables for a new day
export const initializeTablesForNewDay = async () => {
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().add(1, "day").startOf("day").toDate();
  
  // Check if today's report exists
  const todayReport = await prisma.dailyReport.findFirst({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // If no report for today exists, it's a new day - open all tables that were closed before today
  if (!todayReport) {
    // Get all tables that were closed before today (yesterday or earlier)
    const tablesToOpen = await prisma.table.findMany({
      where: {
        OR: [
          { isOpen: false, closedAt: { lt: today } },
          { isOpen: false, closedAt: null },
        ],
        deletedAt: null,
      },
    });

    // Open all tables that were closed before today
    if (tablesToOpen.length > 0) {
      await prisma.table.updateMany({
        where: {
          id: { in: tablesToOpen.map((t) => t.id) },
        },
        data: {
          isOpen: true,
          openedAt: dayjs().toDate(),
          closedAt: null,
        },
      });
    }
  }
};

export const getAllTables = async () => {
  // Initialize tables for new day if needed
  await initializeTablesForNewDay();
  
  return await prisma.table.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: { openedAt: "desc" },
  });
};

export const getActiveTables = async () => {
  // Initialize tables for new day if needed
  await initializeTablesForNewDay();
  
  return await prisma.table.findMany({
    where: { 
      isOpen: true,
      deletedAt: null,
    },
    orderBy: { openedAt: "desc" },
  });
};

export const getClosedTables = async () => {
  return await prisma.table.findMany({
    where: { 
      isOpen: false,
      deletedAt: null,
    },
    orderBy: { openedAt: "desc" },
  });
};

export const deleteTable = async (tableId: string) => {
  // Soft delete - set deletedAt instead of actually deleting
  return await prisma.table.update({
    where: { id: tableId },
    data: {
      deletedAt: dayjs().toDate(),
    },
  });
};

export const createSale = async (tableId: string) => {
  return await prisma.sale.create({
    data: {
      tableId,
      total: 0,
      isPaid: false,
      isOnCredit: false,
      openedAt: dayjs().toDate(),
      createdAt: dayjs().toDate(),
    },
  });
};

export const addItemToSale = async (saleId: string, productId: string, quantity: number) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    const unitPrice = product.price;
    const total = unitPrice * quantity;

    await tx.saleItem.create({
      data: {
        saleId,
        productId,
        quantity,
        unitPrice,
      },
    });

    await tx.sale.update({
      where: { id: saleId },
      data: {
        total: {
          increment: total,
        },
      },
    });

    return await tx.sale.findUnique({
      where: { id: saleId },
      include: { saleItems: true },
    });
  });
};

export const getProducts = async () => {
  return await prisma.product.findMany();
};

export const getSalesByTable = async (tableId: string) => {
  return await prisma.sale.findMany({
    where: { tableId },
    include: {
      saleItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getActiveSalesByTable = async (tableId: string) => {
  return await prisma.sale.findMany({
    where: { 
      tableId,
      isPaid: false,
      table: {
        deletedAt: null,
      },
    },
    include: {
      saleItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getTableWithSales = async (tableId: string) => {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });
  
  if (!table) return null;

  const activeSales = await getActiveSalesByTable(tableId);
  const allSales = await getSalesByTable(tableId);
  
  // Calculate total amount for active sales
  const totalAmount = activeSales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    ...table,
    sales: allSales,
    activeSales,
    currentTotal: totalAmount,
  };
};

export const updateTablePosition = async (
  tableId: string,
  gridX: number,
  gridY: number,
  roomId?: string
) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: {
      gridX,
      gridY,
      ...(roomId && { roomId }),
    },
  });
};

export const updateTable = async (
  tableId: string,
  data: {
    name?: string;
    roomId?: string;
    gridX?: number;
    gridY?: number;
    customerName?: string;
    isOpen?: boolean;
    closedAt?: Date;
  }
) => {
  return await prisma.table.update({
    where: { id: tableId },
    data,
  });
};

export const closeTable = async (tableId: string) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: {
      isOpen: false,
      closedAt: dayjs().toDate(),
    },
  });
};

export const reopenTable = async (tableId: string) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: {
      isOpen: true,
      closedAt: null,
      openedAt: dayjs().toDate(),
    },
  });
};


// export const removeItemFromSale = (
//   saleId: string,
//   saleItemId: string
// ): Sale | null => {
//   const sales = getAllSales();
//   const saleIndex = sales.findIndex((s) => s.id === saleId);

//   if (saleIndex === -1) return null;

//   const itemIndex = sales[saleIndex].saleItems.findIndex(
//     (item) => item.id === saleItemId
//   );

//   if (itemIndex === -1) return null;

//   const removedItem = sales[saleIndex].saleItems[itemIndex];
//   sales[saleIndex].total -= removedItem.unitPrice * removedItem.quantity;
//   sales[saleIndex].saleItems.splice(itemIndex, 1);
//   saveSales(sales);
//   return sales[saleIndex];
// };

// export const updateItemQuantity = (
//   saleId: string,
//   saleItemId: string,
//   newQuantity: number
// ): Sale | null => {
//   const sales = getAllSales();
//   const saleIndex = sales.findIndex((s) => s.id === saleId);

//   if (saleIndex === -1) return null;

//   const itemIndex = sales[saleIndex].saleItems.findIndex(
//     (item) => item.id === saleItemId
//   );

//   if (itemIndex === -1) return null;

//   const item = sales[saleIndex].saleItems[itemIndex];
//   const oldTotal = item.unitPrice * item.quantity;
//   const newTotal = item.unitPrice * newQuantity;

//   sales[saleIndex].total += newTotal - oldTotal;
//   sales[saleIndex].saleItems[itemIndex].quantity = newQuantity;
//   saveSales(sales);
//   return sales[saleIndex];
// };

// export const completeSale = (
//   saleId: string,
//   paymentType: PaymentType,
//   paidAmount?: number
// ): Sale | null => {
//   const sales = getAllSales();
//   const saleIndex = sales.findIndex((s) => s.id === saleId);

//   if (saleIndex === -1) return null;

//   sales[saleIndex].isPaid = true;
//   sales[saleIndex].paidAt = dayjs().toDate();
//   sales[saleIndex].paymentType = paymentType;
//   sales[saleIndex].paidAmount = paidAmount || sales[saleIndex].total;
//   saveSales(sales);
//   return sales[saleIndex];
// };

// export const getSale = (saleId: string): Sale | null => {
//   const sales = getAllSales();
//   return sales.find((s) => s.id === saleId) || null;
// };

// export const getAllSales = (): Sale[] => {
//   const today = getTodayDate();
//   const storedData = getStoredSales();
//   return storedData[today] || [];
// };

// export const getSalesByTable = (tableId: string): Sale[] => {
//   return getAllSales().filter((sale) => sale.tableId === tableId);
// };

// export const getActiveSalesByTable = (tableId: string): Sale[] => {
//   return getAllSales().filter(
//     (sale) => sale.tableId === tableId && !sale.isPaid
//   );
// };

// export const getPaidSales = (): Sale[] => {
//   return getAllSales().filter((sale) => sale.isPaid);
// };

// export const getUnpaidSales = (): Sale[] => {
//   return getAllSales().filter((sale) => !sale.isPaid);
// };

// export const getTableWithSales = (tableId: string) => {
//   const table = getTable(tableId);
//   if (!table) return null;

//   const sales = getSalesByTable(tableId);
//   const activeSales = getActiveSalesByTable(tableId);
//   const totalAmount = activeSales.reduce((sum, sale) => sum + sale.total, 0);

//   return {
//     ...table,
//     sales,
//     activeSales,
//     currentTotal: totalAmount,
//   };
// };
