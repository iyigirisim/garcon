import { NextRequest, NextResponse } from "next/server";
import { createEndOfDayReport } from "@/actions/daily-report";

export async function POST(request: NextRequest) {
  try {
    const report = await createEndOfDayReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error creating end of day report:", error);
    return NextResponse.json({ error: "Failed to create end of day report" }, { status: 500 });
  }
}






