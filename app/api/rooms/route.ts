import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { order: "asc" },
      include: {
        tables: true,
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color, order } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        color: color || "#10b981",
        order: order || 0,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}






