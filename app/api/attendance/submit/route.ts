import { NextRequest } from "next/server";
import { POST as submitAttendance } from "@/app/api/attendance/route";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return submitAttendance(request);
}
