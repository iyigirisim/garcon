"use server";

import { prisma } from "@/utils/db/prisma";
import { PaymentType } from "@/types";
import dayjs from "dayjs";

export const createEndOfDayReport = async () => {
  // Start from 9 AM today
  const todayStart = dayjs().startOf("day").add(9, "hour").toDate();
  // End at 9 AM tomorrow (which is the start of next day's period)
  const tomorrowStart = dayjs().add(1, "day").startOf("day").add(9, "hour").toDate();

  // Get all paid sales from 9 AM today onwards
  const paidSales = await prisma.sale.findMany({
    where: {
      isPaid: true,
      paidAt: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  });

  // Calculate totals by payment type
  const totalCash = paidSales
    .filter((s) => s.paymentType === PaymentType.CASH)
    .reduce((sum, s) => sum + (s.paidAmount || s.total), 0);

  const totalCard = paidSales
    .filter((s) => s.paymentType === PaymentType.CARD)
    .reduce((sum, s) => sum + (s.paidAmount || s.total), 0);

  const totalFoodTicket = paidSales
    .filter((s) => s.paymentType === PaymentType.FOOD_TICKET)
    .reduce((sum, s) => sum + (s.paidAmount || s.total), 0);

  const totalOther = paidSales
    .filter((s) => s.paymentType === PaymentType.OTHER)
    .reduce((sum, s) => sum + (s.paidAmount || s.total), 0);

  const totalSales = totalCash + totalCard + totalFoodTicket + totalOther;
  const salesCount = paidSales.length;

  // Create the daily report (use today's date, but report includes sales from 9 AM)
  const report = await prisma.dailyReport.create({
    data: {
      date: dayjs().startOf("day").toDate(),
      totalCash,
      totalCard,
      totalFoodTicket,
      totalOther,
      totalSales,
      salesCount,
    },
  });

  // Close all open tables
  await prisma.table.updateMany({
    where: { isOpen: true },
    data: {
      isOpen: false,
      closedAt: new Date(),
    },
  });

  return report;
};

export const getDailyReports = async (limit: number = 30) => {
  return await prisma.dailyReport.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
};

export const getDailyReport = async (reportId: string) => {
  return await prisma.dailyReport.findUnique({
    where: { id: reportId },
  });
};

export const getTodayReport = async () => {
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().add(1, "day").startOf("day").toDate();

  return await prisma.dailyReport.findFirst({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
};




