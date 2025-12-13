import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        room: true,
        sales: {
          include: {
            saleItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error fetching table:", error);
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, roomId, gridX, gridY, customerName, isOpen, closedAt } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (roomId !== undefined) updateData.roomId = roomId;
    if (gridX !== undefined) updateData.gridX = gridX;
    if (gridY !== undefined) updateData.gridY = gridY;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (isOpen !== undefined) {
      updateData.isOpen = isOpen;
      if (isOpen) {
        updateData.openedAt = dayjs().toDate();
        updateData.closedAt = null;
      } else {
        updateData.closedAt = dayjs().toDate();
      }
    }
    if (closedAt !== undefined) updateData.closedAt = closedAt ? new Date(closedAt) : null;

    const table = await prisma.table.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id: params.id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Don't allow deletion of take-away table
    if (table.isTakeAway) {
      return NextResponse.json(
        { error: "Cannot delete the take-away table" },
        { status: 400 }
      );
    }

    // Soft delete - set deletedAt instead of actually deleting
    // This preserves sales data for reports
    await prisma.table.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}



