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

export const createTable = async (name: string, customerName?: string) => {
  return await prisma.table.create({
    data: {
      name,
      openedAt: dayjs().toDate(),
      isOpen: true,
      customerName,
    },
  });
};

export const getTable = async (tableId: string) => {
  return await prisma.table.findUnique({
    where: { id: tableId },
  });
};

export const getAllTables = async () => {
  return await prisma.table.findMany({
    orderBy: { openedAt: "desc" },
  });
};

export const getActiveTables = async () => {
  return await prisma.table.findMany({
    where: { isOpen: true },
    orderBy: { openedAt: "desc" },
  });
};

export const getClosedTables = async () => {
  return await prisma.table.findMany({
    where: { isOpen: false },
    orderBy: { openedAt: "desc" },
  });
};

export const deleteTable = async (tableId: string) => {
  return await prisma.table.delete({
    where: { id: tableId },
  });
};

export const createSale = async (tableId: string) => {
  return await prisma.sale.create({
    data: {
      tableId,
      total: 0,
      isPaid: false,
      isOnCredit: false,
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
