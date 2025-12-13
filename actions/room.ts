"use server";

import { prisma } from "@/utils/db/prisma";

export const createRoom = async (
  name: string,
  color?: string,
  order?: number,
  gridWidth?: number,
  gridHeight?: number
) => {
  return await prisma.room.create({
    data: {
      name,
      color: color || "#10b981",
      order: order || 0,
      gridWidth: gridWidth || 3,
      gridHeight: gridHeight || 3,
    },
  });
};

export const getAllRooms = async () => {
  return await prisma.room.findMany({
    orderBy: { order: "asc" },
    include: {
      tables: {
        where: {
          deletedAt: null,
        },
      },
    },
  });
};

export const getRoom = async (roomId: string) => {
  return await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      tables: {
        where: {
          deletedAt: null,
        },
      },
    },
  });
};

export const updateRoom = async (
  roomId: string,
  data: {
    name?: string;
    color?: string;
    order?: number;
    gridWidth?: number;
    gridHeight?: number;
  }
) => {
  return await prisma.room.update({
    where: { id: roomId },
    data,
  });
};

export const deleteRoom = async (roomId: string) => {
  // First, unassign all tables from this room
  await prisma.table.updateMany({
    where: { roomId },
    data: { roomId: null },
  });

  return await prisma.room.delete({
    where: { id: roomId },
  });
};

export const getTablesByRoom = async (roomId: string) => {
  return await prisma.table.findMany({
    where: { 
      roomId,
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });
};

// Optimize room grid size: remove empty rows/columns while keeping 3x3 minimum
export const optimizeRoomGrid = async (roomId: string, currentWidth: number, currentHeight: number) => {
  const tables = await prisma.table.findMany({
    where: {
      roomId,
      deletedAt: null,
      gridX: { not: null },
      gridY: { not: null },
    },
  });

  if (tables.length === 0) {
    // No tables, keep minimum 3x3
    return { width: 3, height: 3 };
  }

  // Find max X and Y positions
  let maxX = -1;
  let maxY = -1;

  tables.forEach((table) => {
    if (table.gridX !== null && table.gridX > maxX) {
      maxX = table.gridX;
    }
    if (table.gridY !== null && table.gridY > maxY) {
      maxY = table.gridY;
    }
  });

  // Calculate optimal size: max position + 1, but minimum 3x3
  const optimalWidth = Math.max(3, maxX + 1);
  const optimalHeight = Math.max(3, maxY + 1);

  return { width: optimalWidth, height: optimalHeight };
};



