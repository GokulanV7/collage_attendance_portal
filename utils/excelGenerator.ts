/**
 * Excel Report Generator Utility
 * Handles conversion of attendance data to Excel format and triggers download
 */

import * as XLSX from "xlsx";

export interface AttendanceRecord {
  date: string;
  batch: string;
  department: string;
  className: string;
  semester: string;
  period: string;
  staffId: string;
  staffName: string;
  rollNo: string;
  studentName: string;
  status: string;
}

/**
 * Generates and downloads an Excel file containing attendance records
 * @param data - Array of attendance records
 * @param fileName - Name of the Excel file (default: "attendance_report.xlsx")
 * @returns - void (triggers download)
 */
export const generateAttendanceReport = (
  data: AttendanceRecord[],
  fileName: string = "attendance_report.xlsx"
): void => {
  // Validation: Check if data is available
  if (!data || data.length === 0) {
    alert("No data available to generate report");
    return;
  }

  try {
    // Transform data to match Excel column headers
    const transformedData = data.map((record) => ({
      "Student Name": record.studentName,
      "Register Number": record.rollNo,
      Date: new Date(record.date).toLocaleDateString("en-IN"),
      Status: record.status,
      Batch: record.batch,
      Department: record.department,
      Class: record.className,
      Semester: record.semester,
      Period: record.period,
      "Staff ID": record.staffId,
      "Staff Name": record.staffName,
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(transformedData, {
      header: [
        "Student Name",
        "Register Number",
        "Date",
        "Status",
        "Batch",
        "Department",
        "Class",
        "Semester",
        "Period",
        "Staff ID",
        "Staff Name",
      ],
    });

    // Set column widths for better readability
    const columnWidths = [
      { wch: 18 }, // Student Name
      { wch: 15 }, // Register Number
      { wch: 12 }, // Date
      { wch: 12 }, // Status
      { wch: 12 }, // Batch
      { wch: 15 }, // Department
      { wch: 12 }, // Class
      { wch: 12 }, // Semester
      { wch: 15 }, // Period
      { wch: 12 }, // Staff ID
      { wch: 15 }, // Staff Name
    ];

    worksheet["!cols"] = columnWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_col(col) + "1";
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "366092" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Generate timestamp for more unique file names
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFileName = fileName.replace(".xlsx", `_${timestamp}.xlsx`);

    // Write file and trigger download
    XLSX.writeFile(workbook, finalFileName);
  } catch (error) {
    console.error("Error generating Excel report:", error);
    alert("Failed to generate report. Please try again.");
  }
};

/**
 * Generates a summary report with attendance statistics
 * @param data - Array of attendance records
 * @param fileName - Name of the Excel file
 * @returns - void (triggers download)
 */
export const generateAttendanceSummary = (
  data: AttendanceRecord[],
  fileName: string = "attendance_summary.xlsx"
): void => {
  if (!data || data.length === 0) {
    alert("No data available to generate summary");
    return;
  }

  try {
    // Group by student and calculate attendance stats
    const studentStats: {
      [key: string]: {
        name: string;
        rollNo: string;
        present: number;
        absent: number;
        onDuty: number;
        total: number;
      };
    } = {};

    data.forEach((record) => {
      const key = record.rollNo;
      if (!studentStats[key]) {
        studentStats[key] = {
          name: record.studentName,
          rollNo: record.rollNo,
          present: 0,
          absent: 0,
          onDuty: 0,
          total: 0,
        };
      }

      studentStats[key].total++;
      if (record.status === "Present") studentStats[key].present++;
      else if (record.status === "Absent") studentStats[key].absent++;
      else if (record.status === "On-Duty") studentStats[key].onDuty++;
    });

    // Transform to array format
    const summaryData = Object.values(studentStats).map((stat) => ({
      "Student Name": stat.name,
      "Register Number": stat.rollNo,
      Present: stat.present,
      Absent: stat.absent,
      "On-Duty": stat.onDuty,
      Total: stat.total,
      "Attendance %": ((stat.present / stat.total) * 100).toFixed(2) + "%",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(summaryData, {
      header: [
        "Student Name",
        "Register Number",
        "Present",
        "Absent",
        "On-Duty",
        "Total",
        "Attendance %",
      ],
    });

    // Set column widths
    const columnWidths = [
      { wch: 18 }, // Student Name
      { wch: 15 }, // Register Number
      { wch: 10 }, // Present
      { wch: 10 }, // Absent
      { wch: 12 }, // On-Duty
      { wch: 10 }, // Total
      { wch: 12 }, // Attendance %
    ];

    worksheet["!cols"] = columnWidths;

    // Style header row
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_col(col) + "1";
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "366092" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

    // Write with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFileName = fileName.replace(".xlsx", `_${timestamp}.xlsx`);

    XLSX.writeFile(workbook, finalFileName);
  } catch (error) {
    console.error("Error generating summary report:", error);
    alert("Failed to generate summary. Please try again.");
  }
};
