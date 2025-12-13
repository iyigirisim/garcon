import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const isOpen = searchParams.get("isOpen");

    const where: any = {};
    if (roomId) where.roomId = roomId;
    if (isOpen !== null) where.isOpen = isOpen === "true";

    const tables = await prisma.table.findMany({
      where,
      orderBy: { openedAt: "desc" },
      include: {
        room: true,
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, customerName, roomId, gridX, gridY, isTakeAway } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        name,
        openedAt: dayjs().toDate(),
        isOpen: true,
        customerName: customerName || null,
        roomId: roomId || null,
        gridX: gridX ?? null,
        gridY: gridY ?? null,
        isTakeAway: isTakeAway || false,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}






