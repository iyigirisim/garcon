"use server";

import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";
import { PaymentType, ExpenseCategory } from "@/types";

export interface DateRangeReport {
  date: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  cashInHand: number;
  paymentMethods: { type: PaymentType; amount: number }[];
  productSales: { productId: string; name: string; quantity: number; total: number }[];
  expenses: { id: string; category: ExpenseCategory; description: string | null; amount: number; date: string }[];
}

export const getReportData = async (dateStr?: string): Promise<DateRangeReport> => {
  // Default to today if no date provided
  const baseDate = dateStr ? dayjs(dateStr) : dayjs();
  
  // Set time range: 06:00 today to 03:00 tomorrow
  const startDate = baseDate.startOf("day").add(6, "hour").toDate();
  const endDate = baseDate.add(1, "day").startOf("day").add(3, "hour").toDate();

  // Fetch Sales
  const sales = await prisma.sale.findMany({
    where: {
      isPaid: true,
      paidAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      saleItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // Fetch Expenses
  const expensesRaw = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const expenses = expensesRaw.map(e => ({
    ...e,
    category: e.category as unknown as ExpenseCategory,
    date: e.date.toISOString(),
  }));

  // Calculate Aggregates
  let totalRevenue = 0;
  const paymentMap = new Map<PaymentType, number>();
  const productMap = new Map<string, { name: string; quantity: number; total: number }>();

  for (const sale of sales) {
    const amount = sale.paidAmount || sale.total;
    totalRevenue += amount;

    // Payment Type Breakdown
    // safe cast or fallback
    const pType = (sale.paymentType as unknown as PaymentType) || PaymentType.OTHER;
    paymentMap.set(pType, (paymentMap.get(pType) || 0) + amount);

    // Product Sales Breakdown
    for (const item of sale.saleItems) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.unitPrice * item.quantity;
      } else {
        productMap.set(item.productId, {
          name: item.product.name,
          quantity: item.quantity,
          total: item.unitPrice * item.quantity,
        });
      }
    }
  }

  // Calculate Total Expenses
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate Cash In Hand (Total Cash Revenue - Total Expenses)
  const totalCashRevenue = paymentMap.get(PaymentType.CASH) || 0;
  const cashInHand = totalCashRevenue - totalExpense;

  // Format Results
  const paymentMethods = Array.from(paymentMap.entries()).map(([type, amount]) => ({
    type,
    amount,
  }));

  const productSales = Array.from(productMap.entries()).map(([productId, data]) => ({
    productId,
    ...data,
  })).sort((a, b) => b.quantity - a.quantity); // Sort by quantity desc

  return {
    date: baseDate.format("YYYY-MM-DD"),
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    cashInHand,
    paymentMethods,
    productSales,
    expenses,
  };
};
