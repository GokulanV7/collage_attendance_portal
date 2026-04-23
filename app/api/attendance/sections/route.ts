import { NextRequest, NextResponse } from "next/server";
import { getSections } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const department = searchParams.get("department");

    if (!year || !department) {
      return NextResponse.json(
        {
          success: false,
          message: "year and department are required",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sections retrieved",
      data: getSections(year, department),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load sections",
      },
      { status: 500 },
    );
  }
}
