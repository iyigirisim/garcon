import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    const reports = await prisma.dailyReport.findMany({
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    return NextResponse.json({ error: "Failed to fetch daily reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, totalCash, totalCard, totalFoodTicket, totalOther, totalSales, salesCount } = await request.json();

    const report = await prisma.dailyReport.create({
      data: {
        date: date ? new Date(date) : dayjs().startOf("day").toDate(),
        totalCash: totalCash || 0,
        totalCard: totalCard || 0,
        totalFoodTicket: totalFoodTicket || 0,
        totalOther: totalOther || 0,
        totalSales: totalSales || 0,
        salesCount: salesCount || 0,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error creating daily report:", error);
    return NextResponse.json({ error: "Failed to create daily report" }, { status: 500 });
  }
}






