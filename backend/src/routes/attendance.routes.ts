import express, { Request, Response } from "express";
import { MOCK_DATABASE, SUBJECTS_BY_DEPARTMENT } from "../data/dataGenerator";
import {
  AttendanceRecord,
  SubmitAttendanceRequest,
  ApiResponse,
} from "../types";

const router = express.Router();

const toStatus = (value: string | undefined): "present" | "absent" | "on-duty" => {
  const normalized = (value || "present").toLowerCase();
  if (normalized === "absent") return "absent";
  if (normalized === "on-duty" || normalized === "onduty") return "on-duty";
  return "present";
};

const toUiStatus = (value: "present" | "absent" | "on-duty"): "Present" | "Absent" | "On-Duty" => {
  if (value === "absent") return "Absent";
  if (value === "on-duty") return "On-Duty";
  return "Present";
};

// Submit Attendance
router.post("/submit", (req: Request, res: Response) => {
  try {
    const data = req.body as SubmitAttendanceRequest;

    // Validate
    if (
      !data.staffId ||
      !data.year||
      !data.department ||
      !data.class
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const effectiveSection = data.section || data.class;
    const effectiveDate = data.date || new Date().toISOString().split("T")[0];
    const classToken = data.class.includes("-")
      ? data.class.split("-").pop() || data.class
      : data.class;
    const sectionToken = effectiveSection.includes("-")
      ? effectiveSection.split("-").pop() || effectiveSection
      : effectiveSection;

    // Validate students exist
    let students = MOCK_DATABASE.students.filter(
      (s) =>
        s.year === data.year &&
        s.department === data.department &&
        s.class === classToken,
    );

    if (students.length === 0 && effectiveSection) {
      students = MOCK_DATABASE.students.filter(
        (s) =>
          s.year === data.year &&
          s.department === data.department &&
          s.class === classToken &&
          s.section === sectionToken,
      );
    }

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for this section",
      });
    }

    if (!data.attendance && !Array.isArray(data.attendanceList)) {
      return res.status(400).json({
        success: false,
        message: "Attendance payload is required",
      });
    }

    const normalizedAttendance: Record<string, "present" | "absent" | "on-duty"> = {};
    if (Array.isArray(data.attendanceList) && data.attendanceList.length > 0) {
      data.attendanceList.forEach((item) => {
        normalizedAttendance[item.rollNo] = toStatus(item.status);
      });
    } else {
      Object.entries(data.attendance || {}).forEach(([key, status]) => {
        normalizedAttendance[key] = toStatus(status);
      });
    }

    const record: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      staffId: data.staffId,
      staffName:
        data.staffName ||
        MOCK_DATABASE.staff.find((s) => s.staffId === data.staffId || s.id === data.staffId)?.name ||
        data.staffId,
      year: data.year,
      department: data.department,
      class: classToken,
      section: sectionToken,
      semester: data.semester,
      subject: data.subject,
      subjectCode: data.subjectCode,
      date: effectiveDate,
      attendance: normalizedAttendance,
      submittedAt: new Date().toISOString(),
      submittedBy: data.staffId,
    };

    // Idempotent write: update same-day same-context record instead of creating duplicates.
    const existingIndex = MOCK_DATABASE.attendance.findIndex(
      (item) =>
        item.year === record.year &&
        item.department === record.department &&
        item.class === record.class &&
        item.section === record.section &&
        item.date === record.date &&
        (item.subjectCode || "") === (record.subjectCode || ""),
    );

    if (existingIndex >= 0) {
      const existing = MOCK_DATABASE.attendance[existingIndex] as AttendanceRecord;
      record.id = existing.id;
      MOCK_DATABASE.attendance[existingIndex] = record;
    } else {
      MOCK_DATABASE.attendance.push(record);
    }

    return res.json({
      success: true,
      message: existingIndex >= 0 ? "Attendance updated successfully" : "Attendance submitted successfully",
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

// Get sections by batch + department
router.get("/sections", (req: Request, res: Response) => {
  try {
    const { year, department } = req.query;
    if (!year || !department) {
      return res.status(400).json({ success: false, message: "year and department are required" });
    }

    const sections = Array.from(
      new Set(
        MOCK_DATABASE.students
          .filter((s) => s.year === year && s.department === department)
          .map((s) => s.class),
      ),
    ).sort();

    return res.json({
      success: true,
      message: "Sections retrieved",
      data: sections,
    } as ApiResponse<string[]>);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error retrieving sections", error: error.message });
  }
});

// Get subjects by department
router.get("/subjects", (req: Request, res: Response) => {
  try {
    const { department } = req.query;
    if (!department || typeof department !== "string") {
      return res.status(400).json({ success: false, message: "department is required" });
    }

    const subjects = SUBJECTS_BY_DEPARTMENT[department] || [];
    return res.json({
      success: true,
      message: "Subjects retrieved",
      data: subjects,
    } as ApiResponse<Array<{ code: string; name: string }>>);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error retrieving subjects", error: error.message });
  }
});

// Subject-wise mark status for section/date
router.get("/subject-status", (req: Request, res: Response) => {
  try {
    const { year, department, section, date } = req.query;
    if (!year || !department || !section || !date) {
      return res.status(400).json({ success: false, message: "year, department, section and date are required" });
    }

    const subjects = SUBJECTS_BY_DEPARTMENT[String(department)] || [];
    const records = MOCK_DATABASE.attendance.filter(
      (r) =>
        r.year === year &&
        r.department === department &&
        r.class === section &&
        r.date === date,
    );

    const statusList = subjects.map((subject) => {
      const rec = records.find((r) => r.subjectCode === subject.code || r.subject === subject.name);
      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        status: rec ? "Marked" : "Not Marked",
        markedBy: rec?.staffName || rec?.staffId || null,
        markedAt: rec?.submittedAt || null,
        date,
      };
    });

    return res.json({
      success: true,
      message: "Subject-wise attendance status retrieved",
      data: statusList,
    } as ApiResponse<any[]>);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error retrieving subject status", error: error.message });
  }
});

// Attendance detail by date + subject + section
router.get("/detail", (req: Request, res: Response) => {
  try {
    const { year, department, section, subjectCode, date } = req.query;
    if (!year || !department || !section || !subjectCode || !date) {
      return res.status(400).json({
        success: false,
        message: "year, department, section, subjectCode and date are required",
      });
    }

    const students = MOCK_DATABASE.students.filter(
      (s) => s.year === year && s.department === department && s.class === section,
    );

    const record = MOCK_DATABASE.attendance.find(
      (r) =>
        r.year === year &&
        r.department === department &&
        r.class === section &&
        r.date === date &&
        (r.subjectCode === subjectCode || r.subject === subjectCode),
    ) as AttendanceRecord | undefined;

    const studentAttendance = students.map((student) => {
      const rawStatus = record?.attendance?.[student.rollNo] || record?.attendance?.[student.id] || "present";
      const normalizedStatus = toStatus(rawStatus);
      return {
        studentId: student.id,
        rollNo: student.rollNo,
        studentName: student.name,
        status: record ? toUiStatus(normalizedStatus) : "Not Marked",
      };
    });

    return res.json({
      success: true,
      message: "Attendance detail retrieved",
      data: {
        marked: !!record,
        markedBy: record?.staffName || record?.staffId || null,
        date,
        section,
        subjectCode,
        studentAttendance,
      },
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error retrieving attendance detail", error: error.message });
  }
});

// Overall attendance analytics by section + subject
router.get("/overall-stats", (req: Request, res: Response) => {
  try {
    const { year, department, section, subjectCode } = req.query;
    if (!year || !department || !section || !subjectCode) {
      return res.status(400).json({
        success: false,
        message: "year, department, section and subjectCode are required",
      });
    }

    const students = MOCK_DATABASE.students.filter(
      (s) => s.year === year && s.department === department && s.class === section,
    );

    const records = MOCK_DATABASE.attendance.filter(
      (r) =>
        r.year === year &&
        r.department === department &&
        r.class === section &&
        (r.subjectCode === subjectCode || r.subject === subjectCode),
    );

    const totalClassesConducted = records.length;

    const studentStats = students.map((student) => {
      let presentCount = 0;
      let absentCount = 0;

      records.forEach((record) => {
        const rawStatus =
          record.attendance?.[student.rollNo] ||
          record.attendance?.[student.id] ||
          "present";
        const normalizedStatus = toStatus(rawStatus);
        if (normalizedStatus === "absent") {
          absentCount += 1;
        } else {
          // Treat on-duty as present for percentage calculations.
          presentCount += 1;
        }
      });

      const attendancePercentage =
        totalClassesConducted > 0
          ? Number(((presentCount / totalClassesConducted) * 100).toFixed(2))
          : 0;

      return {
        student_id: student.id,
        student_name: student.name,
        roll_no: student.rollNo,
        total_classes: totalClassesConducted,
        present_count: presentCount,
        absent_count: absentCount,
        attendance_percentage: attendancePercentage,
      };
    });

    return res.json({
      success: true,
      message: "Overall attendance stats retrieved",
      data: {
        total_classes_conducted: totalClassesConducted,
        students: studentStats,
      },
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving overall attendance stats",
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
