"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin";
import { useStudents } from "@/context/StudentsContext";
import { safeSessionStorage } from "@/utils/safeSessionStorage";
import { generateAttendanceReport, AttendanceRecord as ReportAttendanceRecord } from "@/utils/excelGenerator";
import { api } from "@/lib/api";
import { AttendanceSubmission } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const normalizeText = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const isWithinDateRange = (date: string, dateFrom: string, dateTo: string): boolean => {
  if (!dateFrom && !dateTo) {
    return true;
  }

  const attendanceDate = new Date(date);
  if (Number.isNaN(attendanceDate.getTime())) {
    return false;
  }

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (attendanceDate < fromDate) {
      return false;
    }
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    if (attendanceDate > toDate) {
      return false;
    }
  }

  return true;
};

const matchesAdminDepartment = (
  submissionDepartment: string,
  submissionDepartmentId: string | undefined,
  adminDeptId: string | null,
  adminDeptName: string
): boolean => {
  if (!adminDeptId || adminDeptId === "Overall") {
    return true;
  }

  if (submissionDepartmentId && submissionDepartmentId === adminDeptId) {
    return true;
  }

  const normalizedSubmissionDept = normalizeText(submissionDepartment);
  return (
    normalizedSubmissionDept === normalizeText(adminDeptId) ||
    normalizedSubmissionDept === normalizeText(adminDeptName)
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    EXCELLENT: "bg-emerald-100 text-emerald-700 border-emerald-200",
    SAFE: "bg-blue-100 text-blue-700 border-blue-200",
    WARNING: "bg-amber-100 text-amber-700 border-amber-200",
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.SAFE}`}>
      {status}
    </span>
  );
};

// Summary card component
const SummaryCard = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  badge,
  badgeColor,
  trend,
  trendPositive,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  trendPositive?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
        <div className={iconColor}>{icon}</div>
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          trendPositive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
        }`}>
          {trendPositive ? "+" : ""}{trend}
        </span>
      )}
      {badge && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor || "bg-gray-100 text-gray-600"}`}>
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 font-medium mt-4 uppercase tracking-wide">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

// Custom tooltip for chart
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-100">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-lg font-bold text-blue-600">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { students } = useStudents();
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([]);
  
  // State
  const [adminDept, setAdminDept] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("Admin");
  const [filters, setFilters] = useState({
    academicYear: "All",
    classSection: "All",
    semester: "All",
    dateFrom: "",
    dateTo: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const refreshSubmissions = useCallback(async () => {
    try {
      const response = await api.getAttendance();
      const records = Array.isArray(response?.data?.records)
        ? response.data.records
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setSubmissions(records as AttendanceSubmission[]);
    } catch (error) {
      console.error("Failed to refresh submissions:", error);
    }
  }, []);

  // Auth check
  useEffect(() => {
    const isAdmin = safeSessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    const dept = safeSessionStorage.getItem("adminDeptId") || "Overall";
    const name = safeSessionStorage.getItem("adminDeptName") || "Admin";
    setAdminDept(dept);
    setAdminName(name);
    void refreshSubmissions();
  }, [router, refreshSubmissions]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshSubmissions();
    }, 10000);

    const onFocus = () => {
      void refreshSubmissions();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshSubmissions]);

  const departmentSubmissions = useMemo(() => {
    return submissions.filter((submission) =>
      matchesAdminDepartment(submission.department, submission.departmentId, adminDept, adminName)
    );
  }, [submissions, adminDept, adminName]);

  const filteredSubmissions = useMemo(() => {
    return departmentSubmissions.filter((submission) => {
      if (filters.academicYear !== "All" && submission.batch !== filters.academicYear) {
        return false;
      }

      if (filters.classSection !== "All" && submission.class !== filters.classSection) {
        return false;
      }

      if (filters.semester !== "All" && String(submission.semester) !== filters.semester) {
        return false;
      }

      if (!isWithinDateRange(submission.date, filters.dateFrom, filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [departmentSubmissions, filters]);

  // Filter options
  const academicYears = useMemo(() => {
    const years = new Set<string>([
      ...students.map((student) => student.batch),
      ...departmentSubmissions.map((submission) => submission.batch),
    ]);
    return ["All", ...Array.from(years).sort()];
  }, [students, departmentSubmissions]);

  const classSections = useMemo(() => {
    const classes = new Set<string>([
      ...students.map((student) => student.class),
      ...departmentSubmissions.map((submission) => submission.class),
    ]);
    return ["All", ...Array.from(classes).sort()];
  }, [students, departmentSubmissions]);

  const semesters = useMemo(() => {
    const sems = new Set<string>([
      ...students.map((student) => String(student.semester)),
      ...departmentSubmissions.map((submission) => String(submission.semester)),
    ]);
    return ["All", ...Array.from(sems).sort((a, b) => Number(a) - Number(b))];
  }, [students, departmentSubmissions]);

  // Filter students by admin department and filters
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (adminDept && adminDept !== "Overall") {
      filtered = filtered.filter((student) => {
        const normalizedStudentDept = normalizeText(student.department);
        return (
          normalizedStudentDept === normalizeText(adminDept) ||
          normalizedStudentDept === normalizeText(adminName)
        );
      });
    }

    if (filters.academicYear !== "All") {
      filtered = filtered.filter((student) => student.batch === filters.academicYear);
    }

    if (filters.classSection !== "All") {
      filtered = filtered.filter((student) => student.class === filters.classSection);
    }

    if (filters.semester !== "All") {
      filtered = filtered.filter((student) => String(student.semester) === filters.semester);
    }

    return filtered;
  }, [students, adminDept, adminName, filters]);

  // Calculate attendance data per student
  const studentAttendanceData = useMemo(() => {
    const map = new Map<string, { present: number; total: number; monthly: { present: number; total: number }; recent: { present: number; total: number } }>();
    
    // Get current date for filtering
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    filteredSubmissions.forEach(sub => {
      const subDate = new Date(sub.date);
      sub.attendance.forEach(record => {
        const current = map.get(record.rollNo) || {
          present: 0,
          total: 0,
          monthly: { present: 0, total: 0 },
          recent: { present: 0, total: 0 }
        };
        
        const isPresent = record.status === "Present" || record.status === "On-Duty" ? 1 : 0;
        
        current.present += isPresent;
        current.total += 1;
        
        if (subDate >= monthAgo) {
          current.monthly.present += isPresent;
          current.monthly.total += 1;
        }
        
        if (subDate >= twoWeeksAgo) {
          current.recent.present += isPresent;
          current.recent.total += 1;
        }
        
        map.set(record.rollNo, current);
      });
    });
    
    return map;
  }, [filteredSubmissions]);

  // Students with attendance stats
  const studentsWithStats = useMemo(() => {
    const studentsFromSubmissions = new Map<string, { rollNo: string; name: string }>();

    filteredSubmissions.forEach((submission) => {
      submission.attendance.forEach((record) => {
        if (!studentsFromSubmissions.has(record.rollNo)) {
          studentsFromSubmissions.set(record.rollNo, {
            rollNo: record.rollNo,
            name: record.studentName,
          });
        }
      });
    });

    const mergedStudents = filteredStudents.map((student) => ({
      id: student.id,
      name: student.name,
      rollNo: student.rollNo,
    }));

    studentsFromSubmissions.forEach((student, rollNo) => {
      if (!mergedStudents.find((s) => s.rollNo === rollNo)) {
        mergedStudents.push({
          id: `submission-${rollNo}`,
          name: student.name,
          rollNo,
        });
      }
    });

    return mergedStudents.map(student => {
      const data = studentAttendanceData.get(student.rollNo);
      const overallPercent = data && data.total > 0 ? (data.present / data.total) * 100 : 0;
      const monthlyPercent = data && data.monthly.total > 0 ? (data.monthly.present / data.monthly.total) * 100 : 0;
      const recentPercent = data && data.recent.total > 0 ? (data.recent.present / data.recent.total) * 100 : 0;
      
      let status = "SAFE";
      if (overallPercent >= 90) status = "EXCELLENT";
      else if (overallPercent >= 75) status = "SAFE";
      else if (overallPercent >= 65) status = "WARNING";
      else status = "CRITICAL";
      
      return {
        ...student,
        overallPercent,
        monthlyPercent,
        recentPercent,
        status,
      };
    });
  }, [filteredStudents, filteredSubmissions, studentAttendanceData]);

  // Apply search and status filter
  const displayStudents = useMemo(() => {
    let result = [...studentsWithStats];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.rollNo.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "All") {
      result = result.filter(s => s.status === statusFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "rollNo": return a.rollNo.localeCompare(b.rollNo);
        case "attendance": return b.overallPercent - a.overallPercent;
        default: return 0;
      }
    });
    
    return result;
  }, [studentsWithStats, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(displayStudents.length / pageSize);
  const paginatedStudents = displayStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, statusFilter, sortBy]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalStudents = studentsWithStats.length;
    const avgAttendance = studentsWithStats.length > 0 
      ? studentsWithStats.reduce((acc, s) => acc + s.overallPercent, 0) / studentsWithStats.length 
      : 0;
    const below75 = studentsWithStats.filter(s => s.overallPercent < 75).length;
    const below65 = studentsWithStats.filter(s => s.overallPercent < 65).length;
    
    // Calculate working days from submissions
    const uniqueDates = new Set(filteredSubmissions.map(s => s.date));
    const workingDays = uniqueDates.size;
    
    return { totalStudents, avgAttendance, below75, below65, workingDays };
  }, [studentsWithStats, filteredSubmissions]);

  // Trend data for chart (monthly averages)
  const trendData = useMemo(() => {
    const monthMap = new Map<string, { present: number; total: number }>();
    
    filteredSubmissions.forEach(sub => {
      const date = new Date(sub.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      const current = monthMap.get(monthKey) || { present: 0, total: 0 };
      sub.attendance.forEach(record => {
        current.total += 1;
        if (record.status === "Present" || record.status === "On-Duty") {
          current.present += 1;
        }
      });
      monthMap.set(monthKey, current);
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-");
        const labelDate = new Date(Number(year), Number(month) - 1, 1);
        return {
          month: labelDate.toLocaleString("default", { month: "short" }).toUpperCase(),
          attendance: data.total > 0 ? (data.present / data.total) * 100 : 0,
        };
      });
  }, [filteredSubmissions]);

  // Export handler - Excel format
  const handleExport = useCallback(() => {
    const rows: ReportAttendanceRecord[] = [];

    filteredSubmissions.forEach((submission) => {
      const periodLabel = Array.isArray((submission as any).periods)
        ? (submission as any).periods.map((period: any) => period?.name).filter(Boolean).join(", ")
        : "";
      const attendanceList = Array.isArray((submission as any).attendance)
        ? (submission as any).attendance
        : [];

      attendanceList.forEach((record: any) => {
        rows.push({
          date: submission.date,
          batch: submission.batch,
          department: submission.department,
          className: submission.class,
          semester: submission.semester,
          period: periodLabel || "N/A",
          staffId: submission.staffId,
          staffName: submission.staffName,
          rollNo: record.rollNo,
          studentName: record.studentName,
          status: record.status,
        });
      });
    });

    generateAttendanceReport(rows, "dashboard_attendance.xlsx");
  }, [filteredSubmissions]);

  if (!adminDept) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filters.academicYear === "All" ? "All Academic Years" : `Academic Year ${filters.academicYear}`} • {filters.semester === "All" ? "All Semesters" : `Semester ${filters.semester}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">Head of Department, {adminDept}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {adminName.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Academic Year</label>
              <select
                value={filters.academicYear}
                onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {academicYears.map((year, index) => (
                  <option key={`${year}-${index}`} value={year}>{year === "All" ? "All Years" : year}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Class/Section</label>
              <select
                value={filters.classSection}
                onChange={(e) => setFilters(prev => ({ ...prev, classSection: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classSections.map((cls, index) => (
                  <option key={`${cls}-${index}`} value={cls}>{cls === "All" ? "All Sections" : cls}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map((sem, index) => (
                  <option key={`${sem}-${index}`} value={sem}>{sem === "All" ? "All Semesters" : `Semester ${sem}`}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleExport}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Excel
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <SummaryCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            label="Total Students"
            value={summaryStats.totalStudents}
            trend="+2%"
            trendPositive={true}
          />
          <SummaryCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            label="Working Days"
            value={summaryStats.workingDays}
            badge="Total"
            badgeColor="bg-gray-100 text-gray-600"
          />
          <SummaryCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            label="Class Average"
            value={`${summaryStats.avgAttendance.toFixed(1)}%`}
            trend="-1.2%"
            trendPositive={false}
          />
          <SummaryCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            label="Students < 75%"
            value={summaryStats.below75}
            badge="Action Req."
            badgeColor="bg-amber-100 text-amber-700"
          />
          <SummaryCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-red-100"
            iconColor="text-red-600"
            label="Students < 65%"
            value={summaryStats.below65}
            badge="Critical"
            badgeColor="bg-red-100 text-red-700"
          />
        </div>

        {/* Main Content - Table and Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Student Table */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Attendance</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="SAFE">Safe</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                
                {/* Sort */}
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm bg-transparent focus:outline-none"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="rollNo">Sort by Roll No</option>
                    <option value="attendance">Sort by Attendance</option>
                  </select>
                </div>
                
                {/* Export */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                    Export Excel
                </button>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">15-Day %</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly %</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester Overall</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{student.rollNo}</td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">{student.recentPercent.toFixed(0)}%</td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">{student.monthlyPercent.toFixed(0)}%</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-bold ${
                            student.overallPercent >= 90 ? 'text-emerald-600' :
                            student.overallPercent >= 75 ? 'text-blue-600' :
                            student.overallPercent >= 65 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {student.overallPercent.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={student.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No students found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {displayStudents.length === 0
                  ? "Showing 0 students"
                  : `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, displayStudents.length)} of ${displayStudents.length} students`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Semester Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900">Semester Trend</h3>
              <span className="text-xs text-gray-500">Based on selected filters</span>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2} />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorAttendance)"
                    dot={{ fill: "#3B82F6", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Actual %</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{summaryStats.avgAttendance.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Target %</span>
                </div>
                <span className="text-sm font-bold text-gray-900">75.0%</span>
              </div>
            </div>
            
            {/* Insight */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Insight:</span> This chart and table update in real time from staff-marked attendance for the selected filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
