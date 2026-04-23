import { NextRequest, NextResponse } from "next/server";
import { getAttendanceOverview, getAttendanceRows, upsertAttendanceSubmission } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request:", body);

    const result = await upsertAttendanceSubmission(body);
    const dbResponse = {
      updated: result.updated,
      recordId: result.record.id,
      studentCount: result.record.students.length,
    };
    console.log("Response:", dbResponse);

    return NextResponse.json({
      success: true,
      message: result.updated ? "Attendance updated successfully" : "Attendance submitted successfully",
      data: result.record,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to submit attendance",
      },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || undefined;
    const batch = searchParams.get("batch") || undefined;
    const department = searchParams.get("department") || undefined;
    const section = searchParams.get("section") || undefined;
    const className = searchParams.get("class") || undefined;
    const subject = searchParams.get("subject") || undefined;
    const subjectCode = searchParams.get("subjectCode") || undefined;
    const date = searchParams.get("date") || undefined;

    if (section && (subject || subjectCode) && date) {
      const rows = await getAttendanceRows({
        year,
        batch,
        department,
        section,
        class: className,
        subject,
        subjectCode,
        date,
      });

      return NextResponse.json({
        success: true,
        data: {
          students: rows.map((row) => ({
            name: row.name,
            status: row.status,
          })),
        },
      });
    }

    const records = await getAttendanceOverview({
      year,
      batch,
      department,
      section,
      class: className,
      subject,
      subjectCode,
      date,
    });

    return NextResponse.json({
      success: true,
      data: {
        records,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch attendance",
      },
      { status: 500 },
    );
  }
}
