import { NextRequest, NextResponse } from "next/server";
import { getOverallStats } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const department = searchParams.get("department");
    const section = searchParams.get("section");
    const subjectCode = searchParams.get("subjectCode");

    if (!year || !department || !section || !subjectCode) {
      return NextResponse.json(
        {
          success: false,
          message: "year, department, section and subjectCode are required",
        },
        { status: 400 },
      );
    }

    const data = await getOverallStats({
      year,
      department,
      section,
      subjectCode,
    });

    return NextResponse.json({
      success: true,
      message: "Overall attendance stats retrieved",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load overall stats",
      },
      { status: 500 },
    );
  }
}
