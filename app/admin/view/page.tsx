"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  AdminLayout,
  FilterBar,
  FilterState,
  AttendanceTable,
  TableRow,
  AnalyticsCharts,
  calculateChartData,
} from "@/components/admin";
import { useAttendance } from "@/context/AttendanceContext";

export default function AdminView() {
  const { submissions } = useAttendance();
  const [filters, setFilters] = useState<FilterState>({
    batch: "",
    className: "",
    semester: "",
    subject: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  // Get admin department from session
  const adminDeptName = typeof window !== "undefined" 
    ? sessionStorage.getItem("adminDeptName") || ""
    : "";

  // Filter submissions by department
  const deptSubmissions = useMemo(() => {
    return submissions.filter((sub) => sub.department === adminDeptName);
  }, [submissions, adminDeptName]);

  // Get unique filter options
  const batchOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.batch))).filter(Boolean),
    [deptSubmissions]
  );
  const classOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.class))).filter(Boolean),
    [deptSubmissions]
  );
  const semesterOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.semester))).filter(Boolean),
    [deptSubmissions]
  );
  const subjectOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.subject))).filter(Boolean),
    [deptSubmissions]
  );

  // Initialize filters with first available options
  React.useEffect(() => {
    if (batchOptions.length && !filters.batch) {
      setFilters((prev) => ({ ...prev, batch: batchOptions[0] }));
    }
  }, [batchOptions, filters.batch]);

  // Flatten submissions to rows
  const allRows: TableRow[] = useMemo(() => {
    const flat: TableRow[] = [];
    deptSubmissions.forEach((submission) => {
      submission.attendance.forEach((record) => {
        submission.periods.forEach((period) => {
          flat.push({
            date: submission.date,
            batch: submission.batch,
            department: submission.department,
            className: submission.class,
            semester: submission.semester,
            subject: submission.subject || "",
            period: period.name,
            staffId: submission.staffId,
            staffName: submission.staffName,
            rollNo: record.rollNo,
            studentName: record.studentName,
            status: record.status,
          });
        });
      });
    });
    return flat;
  }, [deptSubmissions]);

  // Calculate attendance percentage per student
  const studentAttendance = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    allRows.forEach((row) => {
      const current = map.get(row.rollNo) || { present: 0, total: 0 };
      map.set(row.rollNo, {
        present: current.present + (row.status === "Present" || row.status === "On-Duty" ? 1 : 0),
        total: current.total + 1,
      });
    });
    return map;
  }, [allRows]);

  // Add attendance percentage to rows
  const rowsWithAttendance: TableRow[] = useMemo(() => {
    return allRows.map((row) => {
      const data = studentAttendance.get(row.rollNo);
      const attendancePercent = data && data.total > 0 
        ? (data.present / data.total) * 100 
        : undefined;
      return { ...row, attendancePercent };
    });
  }, [allRows, studentAttendance]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return rowsWithAttendance.filter((row) => {
      if (filters.batch && row.batch !== filters.batch) return false;
      if (filters.className && row.className !== filters.className) return false;
      if (filters.semester && row.semester !== filters.semester) return false;
      if (filters.subject && row.subject !== filters.subject) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!`${row.studentName} ${row.rollNo}`.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [rowsWithAttendance, filters]);

  // Calculate chart data
  const chartData = useMemo(() => {
    return calculateChartData(
      deptSubmissions.map((s) => ({
        subject: s.subject || "",
        date: s.date,
        attendance: s.attendance,
      }))
    );
  }, [deptSubmissions]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      "Student Name",
      "Roll No",
      "Class",
      "Semester",
      "Subject",
      "Date",
      "Period",
      "Staff",
      "Status",
      "Attendance %",
    ];
    
    const csvData = filteredRows.map((row) =>
      [
        row.studentName,
        row.rollNo,
        row.className,
        row.semester,
        row.subject,
        row.date,
        row.period,
        row.staffName,
        row.status,
        row.attendancePercent?.toFixed(1) || "",
      ].join(",")
    );

    const csv = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Analytics Charts */}
        <AnalyticsCharts
          subjectData={chartData.subjectData}
          statusData={chartData.statusData}
          trendData={chartData.trendData}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          batchOptions={batchOptions}
          classOptions={classOptions}
          semesterOptions={semesterOptions}
          subjectOptions={subjectOptions}
          onExport={handleExport}
        />

        {/* Attendance Table */}
        <AttendanceTable data={filteredRows} pageSize={15} />
      </div>
    </AdminLayout>
  );
}
