import { NextResponse } from "next/server";
import { getStudentsByFilters } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "All students retrieved",
      data: getStudentsByFilters({}),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get all students",
      },
      { status: 500 },
    );
  }
}
