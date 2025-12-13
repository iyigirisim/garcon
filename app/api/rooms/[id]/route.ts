import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        tables: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, color, order } = await request.json();

    const room = await prisma.room.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, unassign all tables from this room
    await prisma.table.updateMany({
      where: { roomId: params.id },
      data: { roomId: null },
    });

    await prisma.room.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}






