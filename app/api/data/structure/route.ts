import { NextResponse } from "next/server";
import { getDataStructure } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Data structure retrieved",
      data: getDataStructure(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get structure",
      },
      { status: 500 },
    );
  }
}
