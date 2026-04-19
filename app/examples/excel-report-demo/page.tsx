"use client";

import { useState } from "react";
import {
  generateAttendanceReport,
  generateAttendanceSummary,
} from "@/utils/excelGenerator";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageLayout } from "@/components/PageLayout";

// Sample attendance data for demo
const SAMPLE_DATA = [
  {
    studentName: "John Doe",
      rollNo: "101",
    date: "2026-04-06",
    status: "Present",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 1",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
  {
    studentName: "Alice Johnson",
      rollNo: "102",
    date: "2026-04-06",
    status: "Absent",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 1",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
  {
    studentName: "Bob Williams",
      rollNo: "103",
    date: "2026-04-06",
    status: "Present",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 1",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
  {
    studentName: "Charlie Brown",
      rollNo: "104",
    date: "2026-04-06",
    status: "On-Duty",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 1",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
  {
    studentName: "John Doe",
      rollNo: "101",
    date: "2026-04-05",
    status: "Present",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 2",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
  {
    studentName: "Alice Johnson",
      rollNo: "102",
    date: "2026-04-05",
    status: "Present",
    batch: "2024-2025",
    department: "Computer Science",
    className: "Class A",
    semester: "3",
    period: "Period 2",
    staffId: "STF001",
    staffName: "Dr. Smith",
  },
];

export default function ExcelReportDemo() {
  const [downloadCount, setDownloadCount] = useState(0);

  const handleGenerateDetailedReport = () => {
    generateAttendanceReport(SAMPLE_DATA, "attendance_report.xlsx");
    setDownloadCount((prev) => prev + 1);
  };

  const handleGenerateSummary = () => {
    generateAttendanceSummary(SAMPLE_DATA, "attendance_summary.xlsx");
    setDownloadCount((prev) => prev + 1);
  };

  const handleGenerateEmptyReport = () => {
    // Try to generate report with empty data (should show validation message)
    generateAttendanceReport([], "attendance_report.xlsx");
  };

  return (
    <PageLayout
      title="Excel Report Generation"
      subtitle="Demo: Generate and download attendance reports as Excel files"
    >
      <div className="space-y-6">
        {/* Instructions Card */}
        <Card className="bg-brand-primarySoft border border-brand-secondary/30">
          <div className="p-6">
            <h2 className="text-lg font-bold text-brand-secondary mb-2">
              📚 How to Use Excel Report Generation
            </h2>
            <p className="text-neutral-primary mb-4">
              This demo showcases the Excel report generation feature. Click any
              button below to generate and automatically download an Excel file
              with the corresponding data.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-primary">
              <li>
                <strong>Detailed Report:</strong> Generates a complete Excel file
                with all attendance records (columns: Student Name, Register
                Number, Date, Status, Batch, Department, Class, Semester, Period,
                Staff ID, Staff Name)
              </li>
              <li>
                <strong>Summary Report:</strong> Generates an Excel file with
                attendance statistics per student (Present count, Absent count,
                On-Duty count, Attendance percentage)
              </li>
              <li>
                <strong>Validation:</strong> If no data is available, a message
                will be displayed instead of creating an empty file
              </li>
            </ul>
          </div>
        </Card>

        {/* Sample Data Display */}
        <Card className="border border-neutral-border">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">📊 Sample Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-brand-primarySoft">
                  <tr>
                    <th className="border border-neutral-border px-4 py-2 text-left font-semibold">
                      Student Name
                    </th>
                    <th className="border border-neutral-border px-4 py-2 text-left font-semibold">
                       Roll No
                    </th>
                    <th className="border border-neutral-border px-4 py-2 text-left font-semibold">
                      Date
                    </th>
                    <th className="border border-neutral-border px-4 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="border border-neutral-border px-4 py-2 text-left font-semibold">
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DATA.map((record, idx) => (
                    <tr key={idx}>
                      <td className="border border-neutral-border px-4 py-2">
                        {record.studentName}
                      </td>
                      <td className="border border-neutral-border px-4 py-2">
                        {record.rollNo}
                      </td>
                      <td className="border border-neutral-border px-4 py-2">
                        {record.date}
                      </td>
                      <td className="border border-neutral-border px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-status-successSoft text-status-successStrong"
                              : record.status === "Absent"
                                ? "bg-status-dangerSoft text-status-dangerStrong"
                                : "bg-status-infoSoft text-status-infoStrong"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="border border-neutral-border px-4 py-2">
                        {record.className}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Report Generation Actions */}
        <Card className="border border-neutral-border bg-brand-background">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">👇 Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detailed Report Button */}
              <div className="p-4 border border-neutral-border rounded-lg">
                <h4 className="font-semibold mb-2">Detailed Attendance Report</h4>
                <p className="text-sm text-neutral-secondary mb-4">
                  Download all attendance records with complete details for each
                  entry.
                </p>
                <Button
                  onClick={handleGenerateDetailedReport}
                  className="w-full"
                >
                  📄 Generate Detailed Report
                </Button>
              </div>

              {/* Summary Report Button */}
              <div className="p-4 border border-neutral-border rounded-lg">
                <h4 className="font-semibold mb-2">Summary Report</h4>
                <p className="text-sm text-neutral-secondary mb-4">
                  Download a summary with attendance statistics and percentages
                  per student.
                </p>
                <Button
                  onClick={handleGenerateSummary}
                  className="w-full"
                >
                  📊 Generate Summary Report
                </Button>
              </div>

              {/* Validation Test - Empty Data */}
              <div className="p-4 border border-neutral-border rounded-lg">
                <h4 className="font-semibold mb-2">Test Validation</h4>
                <p className="text-sm text-neutral-secondary mb-4">
                  Click this to test the validation. It will attempt to generate
                  a report with empty data.
                </p>
                <Button
                  onClick={handleGenerateEmptyReport}
                  variant="secondary"
                  className="w-full"
                >
                  ⚠️ Test Empty Report
                </Button>
              </div>

              {/* Statistics */}
              <div className="p-4 border border-neutral-border rounded-lg bg-brand-primarySoft">
                <h4 className="font-semibold mb-2">Download Statistics</h4>
                <p className="text-sm text-neutral-secondary mb-2">
                  Reports generated in this session:
                </p>
                <p className="text-3xl font-bold text-brand-secondary">
                  {downloadCount}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Code Example */}
        <Card className="border border-neutral-border">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">💻 Code Example</h3>
            <p className="text-sm text-neutral-secondary mb-3">
              Here's how to use the Excel generation in your components:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-xs">
              <pre>{`import { generateAttendanceReport } from '@/utils/excelGenerator';

// In your component
const handleGenerateReport = () => {
  const attendanceData = [
    {
      studentName: "John Doe",
        rollNo: "101",
      date: "2026-04-06",
      status: "Present",
      batch: "2024-2025",
      department: "CS",
      className: "Class A",
      semester: "3",
      period: "Period 1",
      staffId: "STF001",
      staffName: "Dr. Smith"
    },
    // ... more records
  ];

  // Generate and download
  generateAttendanceReport(
    attendanceData,
    "attendance_report.xlsx"
  );
};

// In your JSX
<Button onClick={handleGenerateReport}>
  Generate Report
</Button>`}</pre>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="border border-neutral-border bg-brand-background">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">✨ Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="text-2xl">📋</div>
                <div>
                  <p className="font-semibold">Proper Headers</p>
                  <p className="text-sm text-neutral-secondary">
                    Excel files include formatted column headers
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <p className="font-semibold">Formatted Columns</p>
                  <p className="text-sm text-neutral-secondary">
                    Auto-sized columns with readable formatting
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🎨</div>
                <div>
                  <p className="font-semibold">Styled Headers</p>
                  <p className="text-sm text-neutral-secondary">
                    Blue background with white text for headers
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-semibold">Data Validation</p>
                  <p className="text-sm text-neutral-secondary">
                    Shows alert if no data available
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="font-semibold">Timestamped Files</p>
                  <p className="text-sm text-neutral-secondary">
                    Files automatically include date in filename
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-semibold">Frontend Only</p>
                  <p className="text-sm text-neutral-secondary">
                    No backend required, works entirely in browser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
