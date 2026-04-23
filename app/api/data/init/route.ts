import { NextResponse } from "next/server";
import { getInitData } from "@/app/api/_lib/attendanceStore";

export const runtime = "nodejs";

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: "Mock data initialized",
      data: getInitData(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to initialize data",
      },
      { status: 500 },
    );
  }
}
