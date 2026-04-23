import { NextRequest, NextResponse } from "next/server";
import { getSubjects } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "department is required",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subjects retrieved",
      data: getSubjects(department),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load subjects",
      },
      { status: 500 },
    );
  }
}
