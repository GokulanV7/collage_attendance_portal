import { NextRequest, NextResponse } from "next/server";
import { getStudentsByFilters } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = getStudentsByFilters({
      year: searchParams.get("year") || undefined,
      batch: searchParams.get("batch") || undefined,
      department: searchParams.get("department") || undefined,
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Students retrieved",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get students",
      },
      { status: 500 },
    );
  }
}
