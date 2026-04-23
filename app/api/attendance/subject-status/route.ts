import { NextRequest, NextResponse } from "next/server";
import { getSubjectStatusByDate } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const department = searchParams.get("department");
    const section = searchParams.get("section");
    const date = searchParams.get("date");

    if (!year || !department || !section || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "year, department, section and date are required",
        },
        { status: 400 },
      );
    }

    const data = await getSubjectStatusByDate({
      year,
      department,
      section,
      date,
    });

    return NextResponse.json({
      success: true,
      message: "Subject-wise attendance status retrieved",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load subject status",
      },
      { status: 500 },
    );
  }
}
