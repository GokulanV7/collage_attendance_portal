import { NextRequest, NextResponse } from "next/server";
import { getAttendanceDetail } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const department = searchParams.get("department");
    const section = searchParams.get("section");
    const subjectCode = searchParams.get("subjectCode");
    const date = searchParams.get("date");

    if (!year || !department || !section || !subjectCode || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "year, department, section, subjectCode and date are required",
        },
        { status: 400 },
      );
    }

    const data = await getAttendanceDetail({
      year,
      department,
      section,
      subjectCode,
      date,
    });

    return NextResponse.json({
      success: true,
      message: "Attendance detail retrieved",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load attendance detail",
      },
      { status: 500 },
    );
  }
}
