"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin";
import { useAttendance } from "@/context/AttendanceContext";
import { getBatches, getClassesByDepartment, getSubjectsByDepartment, getStudentsByClass } from "@/data/mockDatabase";
import { Batch, Class, Subject } from "@/types";

type View = "classes" | "subjects" | "attendance";

// Normalize batch string: replace em-dash with hyphen for consistent comparison
const normalizeBatch = (b: string): string => b.replace(/\u2013/g, "-");

export default function AdminView() {
  const { submissions } = useAttendance();

  const [adminDeptId, setAdminDeptId] = useState("");
  const [adminDeptName, setAdminDeptName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentView, setCurrentView] = useState<View>("classes");
  const [searchQuery, setSearchQuery] = useState("");

  const batches = getBatches();

  useEffect(() => {
    const deptId = sessionStorage.getItem("adminDeptId") || "";
    const deptName = sessionStorage.getItem("adminDeptName") || "";
    setAdminDeptId(deptId);
    setAdminDeptName(deptName);
    if (batches.length > 0) setSelectedBatch(batches[0].id);
  }, []);

  // Get classes for selected batch + department
  const classes = useMemo(() => {
    if (!selectedBatch || !adminDeptId) return [];
    return getClassesByDepartment(selectedBatch, adminDeptId);
  }, [selectedBatch, adminDeptId]);

  // Get subjects for department
  const subjects = useMemo(() => {
    if (!adminDeptId) return [];
    return getSubjectsByDepartment(adminDeptId);
  }, [adminDeptId]);

  // Filter submissions for the currently selected context
  const contextSubmissions = useMemo(() => {
    const normalizedBatch = normalizeBatch(selectedBatch);
    return submissions.filter((s) => {
      if (normalizeBatch(s.batch) !== normalizedBatch) return false;
      if (s.department !== adminDeptName) return false;
      if (selectedClass && s.class !== selectedClass.name) return false;
      if (selectedSubject && s.subject !== selectedSubject.name) return false;
      return true;
    });
  }, [submissions, selectedBatch, adminDeptName, selectedClass, selectedSubject]);

  // For classes view: count periods per class
  const classStats = useMemo(() => {
    const normalizedBatch = normalizeBatch(selectedBatch);
    const map = new Map<string, { sessions: number; totalRecords: number; presentCount: number }>();
    submissions
      .filter((s) => normalizeBatch(s.batch) === normalizedBatch && s.department === adminDeptName)
      .forEach((s) => {
        const cur = map.get(s.class) || { sessions: 0, totalRecords: 0, presentCount: 0 };
        const periodCount = s.periods.length || 1;
        cur.sessions += periodCount;
        s.attendance.forEach((a) => {
          cur.totalRecords += periodCount;
          if (a.status === "Present" || a.status === "On-Duty") cur.presentCount += periodCount;
        });
        map.set(s.class, cur);
      });
    return map;
  }, [submissions, selectedBatch, adminDeptName]);

  // For subjects view: count periods per subject for selected class
  const subjectStats = useMemo(() => {
    if (!selectedClass) return new Map<string, { sessions: number; totalRecords: number; presentCount: number }>();
    const normalizedBatch = normalizeBatch(selectedBatch);
    const map = new Map<string, { sessions: number; totalRecords: number; presentCount: number }>();
    submissions
      .filter((s) => normalizeBatch(s.batch) === normalizedBatch && s.department === adminDeptName && s.class === selectedClass.name)
      .forEach((s) => {
        const cur = map.get(s.subject) || { sessions: 0, totalRecords: 0, presentCount: 0 };
        const periodCount = s.periods.length || 1;
        cur.sessions += periodCount;
        s.attendance.forEach((a) => {
          cur.totalRecords += periodCount;
          if (a.status === "Present" || a.status === "On-Duty") cur.presentCount += periodCount;
        });
        map.set(s.subject, cur);
      });
    return map;
  }, [submissions, selectedBatch, adminDeptName, selectedClass]);

  // For attendance view: per-student stats (includes ALL students in the class)
  const studentAttendanceData = useMemo(() => {
    if (!selectedClass || !selectedSubject || !adminDeptId || !selectedBatch) return [];

    // Get all students from the class
    const allStudents = getStudentsByClass(selectedBatch, adminDeptId, selectedClass.id);

    // Build attendance map from submissions
    // Each submission covers N periods, so multiply counts by the number of periods
    const attendanceMap = new Map<string, { name: string; rollNo: string; present: number; absent: number; onDuty: number; total: number }>();

    contextSubmissions.forEach((s) => {
      const periodCount = s.periods.length || 1;
      s.attendance.forEach((a) => {
        const cur = attendanceMap.get(a.rollNo) || { name: a.studentName, rollNo: a.rollNo, present: 0, absent: 0, onDuty: 0, total: 0 };
        cur.total += periodCount;
        if (a.status === "Present") cur.present += periodCount;
        else if (a.status === "Absent") cur.absent += periodCount;
        else if (a.status === "On-Duty") cur.onDuty += periodCount;
        attendanceMap.set(a.rollNo, cur);
      });
    });

    // Merge: include all students from class, filling in zeros for those without attendance records
    const merged = allStudents.map((student) => {
      const record = attendanceMap.get(student.rollNo);
      if (record) return record;
      return { name: student.name, rollNo: student.rollNo, present: 0, absent: 0, onDuty: 0, total: 0 };
    });

    // Also add any students from attendance records that aren't in the current class list (edge case)
    attendanceMap.forEach((record, rollNo) => {
      if (!allStudents.find((s) => s.rollNo === rollNo)) {
        merged.push(record);
      }
    });

    return merged.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [contextSubmissions, selectedClass, selectedSubject, adminDeptId, selectedBatch]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentAttendanceData;
    const q = searchQuery.toLowerCase();
    return studentAttendanceData.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
    );
  }, [studentAttendanceData, searchQuery]);

  // Navigation
  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setCurrentView("subjects");
    setSearchQuery("");
  };

  const handleSubjectClick = (sub: Subject) => {
    setSelectedSubject(sub);
    setCurrentView("attendance");
    setSearchQuery("");
  };

  const handleBack = () => {
    if (currentView === "attendance") {
      setSelectedSubject(null);
      setCurrentView("subjects");
      setSearchQuery("");
    } else if (currentView === "subjects") {
      setSelectedClass(null);
      setCurrentView("classes");
      setSearchQuery("");
    }
  };

  const handleBatchChange = (val: string) => {
    setSelectedBatch(val);
    setSelectedClass(null);
    setSelectedSubject(null);
    setCurrentView("classes");
    setSearchQuery("");
  };

  // Export CSV
  const handleExport = useCallback(() => {
    if (currentView !== "attendance" || filteredStudents.length === 0) return;
    const headers = ["Roll No", "Student Name", "Present", "Absent", "On-Duty", "Total", "Attendance %"];
    const rows = filteredStudents.map((s) => [
      s.rollNo,
      s.name,
      s.present,
      s.absent,
      s.onDuty,
      s.total,
      s.total > 0 ? ((s.present + s.onDuty) / s.total * 100).toFixed(1) : "0.0",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedClass?.name}_${selectedSubject?.code}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredStudents, currentView, selectedClass, selectedSubject]);

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return "text-emerald-600 bg-emerald-50";
    if (pct >= 75) return "text-blue-600 bg-blue-50";
    if (pct >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusLabel = (pct: number) => {
    if (pct >= 90) return "Excellent";
    if (pct >= 75) return "Good";
    if (pct >= 60) return "Warning";
    return "Critical";
  };

  // Breadcrumb
  const breadcrumb = () => {
    const items: { label: string; onClick?: () => void }[] = [
      {
        label: `${adminDeptId} - Classes`,
        onClick: currentView !== "classes"
          ? () => { setSelectedClass(null); setSelectedSubject(null); setCurrentView("classes"); setSearchQuery(""); }
          : undefined,
      },
    ];
    if (selectedClass) {
      items.push({
        label: `Section ${selectedClass.name}`,
        onClick: currentView === "attendance"
          ? () => { setSelectedSubject(null); setCurrentView("subjects"); setSearchQuery(""); }
          : undefined,
      });
    }
    if (selectedSubject) {
      items.push({ label: selectedSubject.name });
    }
    return items;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
            <p className="text-sm text-gray-500 mt-1">{adminDeptName}</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Batch:</label>
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb().map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {item.onClick ? (
                <button onClick={item.onClick} className="text-brand-secondary hover:underline font-medium">
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-700 font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Back button */}
        {currentView !== "classes" && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* ===== CLASSES VIEW ===== */}
        {currentView === "classes" && (
          <div>
            {classes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">No Classes Found</h3>
                <p className="text-sm text-gray-400 mt-1">No classes available for this batch and department.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => {
                  const stats = classStats.get(cls.name);
                  const pct = stats && stats.totalRecords > 0
                    ? (stats.presentCount / stats.totalRecords) * 100
                    : null;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => handleClassClick(cls)}
                      className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:shadow-lg hover:border-brand-secondary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                          <svg className="w-6 h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Section {cls.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{adminDeptId} • {selectedBatch}</p>
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        {stats ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{stats.sessions} session{stats.sessions !== 1 ? "s" : ""}</span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getAttendanceColor(pct!)}`}>
                              {pct!.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No attendance data yet</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== SUBJECTS VIEW ===== */}
        {currentView === "subjects" && selectedClass && (
          <div>
            {subjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">No Subjects Found</h3>
                <p className="text-sm text-gray-400 mt-1">No subjects available for this department.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subjects.map((sub) => {
                  const stats = subjectStats.get(sub.name);
                  const pct = stats && stats.totalRecords > 0
                    ? (stats.presentCount / stats.totalRecords) * 100
                    : null;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectClick(sub)}
                      className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-brand-secondary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">{sub.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{sub.code}</p>
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        {stats ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{stats.sessions} session{stats.sessions !== 1 ? "s" : ""}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getAttendanceColor(pct!)}`}>
                              {pct!.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No data yet</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ATTENDANCE VIEW ===== */}
        {currentView === "attendance" && selectedClass && selectedSubject && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(() => {
                const totalStudents = studentAttendanceData.length;
                const totalSessions = contextSubmissions.reduce((sum, s) => sum + (s.periods.length || 1), 0);
                const avgPct = totalStudents > 0
                  ? studentAttendanceData.reduce((sum, s) => sum + (s.total > 0 ? (s.present + s.onDuty) / s.total * 100 : 0), 0) / totalStudents
                  : 0;
                const belowThreshold = studentAttendanceData.filter(
                  (s) => s.total > 0 && (s.present + s.onDuty) / s.total * 100 < 75
                ).length;

                return (
                  <>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Students</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Sessions</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Attendance</p>
                      <p className={`text-2xl font-bold mt-1 ${avgPct >= 75 ? "text-emerald-600" : "text-red-600"}`}>
                        {avgPct.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Below 75%</p>
                      <p className={`text-2xl font-bold mt-1 ${belowThreshold > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {belowThreshold}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Search + Export bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 p-4">
              <div className="relative flex-1 max-w-sm">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or roll no..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary"
                />
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Student table */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">No Attendance Records</h3>
                <p className="text-sm text-gray-400 mt-1">
                  No attendance has been marked for this subject yet.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll No</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Present</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Absent</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">On-Duty</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Attendance %</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, idx) => {
                        const pct = student.total > 0
                          ? (student.present + student.onDuty) / student.total * 100
                          : 0;
                        return (
                          <tr
                            key={student.rollNo}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-5 py-3.5 text-sm text-gray-400">{idx + 1}</td>
                            <td className="px-5 py-3.5 text-sm font-mono font-medium text-gray-700">{student.rollNo}</td>
                            <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-5 py-3.5 text-sm text-center text-emerald-600 font-semibold">{student.present}</td>
                            <td className="px-5 py-3.5 text-sm text-center text-red-600 font-semibold">{student.absent}</td>
                            <td className="px-5 py-3.5 text-sm text-center text-blue-600 font-semibold">{student.onDuty}</td>
                            <td className="px-5 py-3.5 text-sm text-center text-gray-700 font-medium">{student.total}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${getAttendanceColor(pct)}`}>
                                {pct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAttendanceColor(pct)}`}>
                                {getStatusLabel(pct)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
