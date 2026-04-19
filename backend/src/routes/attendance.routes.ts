import express, { Request, Response } from "express";
import { MOCK_DATABASE } from "../data/dataGenerator";
import {
  AttendanceRecord,
  SubmitAttendanceRequest,
  ApiResponse,
} from "../types";

const router = express.Router();

// Submit Attendance
router.post("/submit", (req: Request, res: Response) => {
  try {
    const data = req.body as SubmitAttendanceRequest;

    // Validate
    if (
      !data.staffId ||
      !data.year||
      !data.department ||
      !data.class ||
      !data.section
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate students exist
    const students = MOCK_DATABASE.students.filter(
      (s) =>
        s.year === data.year &&
        s.department === data.department &&
        s.class === data.class &&
        s.section === data.section,
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for this section",
      });
    }

    // Create attendance record
    const record: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      staffId: data.staffId,
      year: data.year,
      department: data.department,
      class: data.class,
      section: data.section,
      date: new Date().toISOString().split("T")[0],
      attendance: data.attendance as Record<string, "present" | "absent" | "on-duty">,
      submittedAt: new Date().toISOString(),
      submittedBy: data.staffId,
    };

    // Store in mock database
    MOCK_DATABASE.attendance.push(record);

    return res.json({
      success: true,
      message: "Attendance submitted successfully",
      data: record,
    } as ApiResponse<AttendanceRecord>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error submitting attendance",
      error: error.message,
    });
  }
});

// Get All Attendance
router.get("/all", (req: Request, res: Response) => {
  try {
    const { year, department, class: cls, section } = req.query;

    let records = MOCK_DATABASE.attendance;

    if (year) records = records.filter((r) => r.year === year);
    if (department)
      records = records.filter((r) => r.department === department);
    if (cls) records = records.filter((r) => r.class === cls);
    if (section) records = records.filter((r) => r.section === section);

    return res.json({
      success: true,
      message: "Attendance records retrieved",
      data: records,
    } as ApiResponse<AttendanceRecord[]>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving attendance",
      error: error.message,
    });
  }
});

// Get by Section
router.get("/by-section", (req: Request, res: Response) => {
  try {
    const { year, department, class: cls, section } = req.query;

    const records = MOCK_DATABASE.attendance.filter(
      (r) =>
        r.year === year &&
        r.department === department &&
        r.class === cls &&
        r.section === section,
    );

    return res.json({
      success: true,
      message: "Attendance for section retrieved",
      data: records,
    } as ApiResponse<AttendanceRecord[]>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving attendance",
      error: error.message,
    });
  }
});

export default router;
