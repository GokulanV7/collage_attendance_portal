import { NextRequest, NextResponse } from "next/server";
import { getAttendanceOverview } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const records = await getAttendanceOverview({
      year: searchParams.get("year") || undefined,
      batch: searchParams.get("batch") || undefined,
      department: searchParams.get("department") || undefined,
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
      date: searchParams.get("date") || undefined,
      subject: searchParams.get("subject") || undefined,
      subjectCode: searchParams.get("subjectCode") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Attendance for section retrieved",
      data: records,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load attendance by section",
      },
      { status: 500 },
    );
  }
}
