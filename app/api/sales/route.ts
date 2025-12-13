import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paidAfter = searchParams.get("paidAfter");
    const paidBefore = searchParams.get("paidBefore");
    const tableId = searchParams.get("tableId");
    const isPaid = searchParams.get("isPaid");

    const where: any = {};
    
    if (paidAfter || paidBefore) {
      where.paidAt = {};
      if (paidAfter) where.paidAt.gte = new Date(paidAfter);
      if (paidBefore) where.paidAt.lt = new Date(paidBefore);
    }
    
    if (tableId) where.tableId = tableId;
    if (isPaid !== null && isPaid !== undefined) where.isPaid = isPaid === "true";

    const sales = await prisma.sale.findMany({
      where,
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}






