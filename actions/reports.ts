"use server";

import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { PaymentType, ExpenseCategory } from "@/types";

dayjs.extend(utc);

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
  // Expenses should be shown on the exact date they were recorded
  // Use a wider date range to account for timezone differences, then filter by exact date match
  const expenseStartDate = baseDate.subtract(1, "day").startOf("day").toDate();
  const expenseEndDate = baseDate.add(2, "day").startOf("day").toDate();
  
  const expensesRaw = await prisma.expense.findMany({
    where: {
      date: {
        gte: expenseStartDate,
        lt: expenseEndDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Filter expenses to only include those that match the selected date exactly
  // Compare dates by their date string (YYYY-MM-DD) to avoid timezone issues
  // This ensures expenses appear on the day they were actually recorded
  const selectedDateStr = baseDate.format("YYYY-MM-DD");
  const filteredExpenses = expensesRaw.filter(expense => {
    // Convert expense date to the same format for comparison
    // Use UTC to avoid timezone issues
    const expenseDate = dayjs(expense.date).utc().format("YYYY-MM-DD");
    return expenseDate === selectedDateStr;
  });

  const expenses = filteredExpenses.map(e => ({
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

  // Calculate Total Expenses (using filtered expenses to match the selected date)
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // --- Monthly Cash Calculation ---
  // Define month range (preserving business hours logic or full month?)
  // User said "o ayki tum nakitleri", implying full month.
  // Standard logic: Start of month 00:00 to End of selected day (Cumulative MTD)
  const monthStart = baseDate.startOf('month').toDate();
  const monthEnd = endDate; // Cumulative up to end of this report day

  const monthlyCashSales = await prisma.sale.findMany({
    where: {
      isPaid: true,
      paymentType: PaymentType.CASH,
      paidAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      paidAmount: true,
      total: true,
    },
  });

  const monthlyCashRevenue = monthlyCashSales.reduce(
    (acc, sale) => acc + (sale.paidAmount || sale.total),
    0
  );
  
  const monthlyExpensesAgg = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
      isPaidFromSafe: true, // Only subtract expenses paid from safe (Cash)
    },
  });

  // Calculate Cash In Hand (Monthly Cash Revenue - Monthly Total Expenses)
  const monthlyTotalExpense = monthlyExpensesAgg._sum?.amount || 0;
  const cashInHand = monthlyCashRevenue - monthlyTotalExpense;


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
