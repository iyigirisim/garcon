import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check if default room exists
    const existingRoom = await prisma.room.findFirst({
      where: { name: "Main Hall" },
    });

    let defaultRoom;
    if (!existingRoom) {
      defaultRoom = await prisma.room.create({
        data: {
          name: "Main Hall",
          color: "#10b981",
          order: 0,
        },
      });
    } else {
      defaultRoom = existingRoom;
    }

    // Check if take-away table exists
    const existingTakeAway = await prisma.table.findFirst({
      where: { isTakeAway: true },
    });

    let takeAwayTable;
    if (!existingTakeAway) {
      takeAwayTable = await prisma.table.create({
        data: {
          name: "Take Away",
          isOpen: true,
          openedAt: new Date(),
          isTakeAway: true,
          roomId: defaultRoom.id,
          gridX: 0,
          gridY: 0,
        },
      });
    } else {
      takeAwayTable = existingTakeAway;
    }

    return NextResponse.json({
      success: true,
      room: defaultRoom,
      takeAwayTable,
      message: "Seed data created successfully",
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}






