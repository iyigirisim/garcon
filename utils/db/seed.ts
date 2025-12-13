import { prisma } from "./prisma";

async function seed() {
  try {
    console.log("Starting seed...");

    // Check if default room exists
    const existingRoom = await prisma.room.findFirst({
      where: { name: "Main Hall" },
    });

    let defaultRoom;
    if (!existingRoom) {
      console.log("Creating default room...");
      defaultRoom = await prisma.room.create({
        data: {
          name: "Main Hall",
          color: "#10b981",
          order: 0,
        },
      });
      console.log("Default room created:", defaultRoom.id);
    } else {
      defaultRoom = existingRoom;
      console.log("Default room already exists:", defaultRoom.id);
    }

    // Check if take-away table exists
    const existingTakeAway = await prisma.table.findFirst({
      where: { isTakeAway: true },
    });

    if (!existingTakeAway) {
      console.log("Creating take-away table...");
      const takeAwayTable = await prisma.table.create({
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
      console.log("Take-away table created:", takeAwayTable.id);
    } else {
      console.log("Take-away table already exists:", existingTakeAway.id);
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed:", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






