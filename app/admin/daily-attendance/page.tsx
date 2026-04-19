"use client";

import { useMemo, useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { useAttendance } from "@/context/AttendanceContext";
import { getBatches, getClassesByDepartment } from "@/data/mockDatabase";

type View = "classes" | "detail";

const normalizeText = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const matchesDepartment = (
  submissionDepartment: string,
  submissionDepartmentId: string | undefined,
  adminDeptId: string,
  adminDeptName: string
): boolean => {
  if (submissionDepartmentId && submissionDepartmentId === adminDeptId) {
    return true;
  }

  const normalizedSubmissionDepartment = normalizeText(submissionDepartment);
  return (
    normalizedSubmissionDepartment === normalizeText(adminDeptId) ||
    normalizedSubmissionDepartment === normalizeText(adminDeptName)
  );
};

export default function DailyAttendancePage() {
  const { submissions } = useAttendance();
  const [adminDeptId, setAdminDeptId] = useState("");
  const [adminDeptName, setAdminDeptName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [currentView, setCurrentView] = useState<View>("classes");

  const batches = getBatches();

  useEffect(() => {
    const deptId = sessionStorage.getItem("adminDeptId") || "";
    const deptName = sessionStorage.getItem("adminDeptName") || "";
    setAdminDeptId(deptId);
    setAdminDeptName(deptName);
    if (batches.length > 0) setSelectedBatch(batches[0].id);
  }, []);

  // Classes for selected batch + department
  const classes = useMemo(() => {
    if (!selectedBatch || !adminDeptId) return [];
    return getClassesByDepartment(selectedBatch, adminDeptId);
  }, [selectedBatch, adminDeptId]);

  // Helper: normalize a date string to YYYY-MM-DD for comparison
  const normalizeDate = (dateStr: string): string => {
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Handle locale formats like "24-Feb-2026" or "24 Feb 2026"
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const match = dateStr.match(/(\d{1,2})[\s-](\w{3})[\s,-]+(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, "0");
      const mon = months[match[2].toLowerCase()];
      const year = match[3];
      if (mon) return `${year}-${mon}-${day}`;
    }
    // Fallback: try Date constructor
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return dateStr;
  };

  // Helper: normalize batch string (em-dash vs hyphen)
  const normalizeBatch = (b: string): string => b.replace(/–/g, "-");

  // All submissions for selected date + department + batch
  const dailySubmissions = useMemo(() => {
    if (!adminDeptName || !selectedDate || !selectedBatch) return [];
    const normalizedSelectedDate = normalizeDate(selectedDate);
    const normalizedSelectedBatch = normalizeBatch(selectedBatch);
    return submissions.filter((s) => {
      const dateMatch = normalizeDate(s.date) === normalizedSelectedDate;
      const deptMatch = matchesDepartment(s.department, s.departmentId, adminDeptId, adminDeptName);
      const batchMatch = normalizeBatch(s.batch) === normalizedSelectedBatch;
      return dateMatch && deptMatch && batchMatch;
    });
  }, [submissions, selectedDate, adminDeptName, adminDeptId, selectedBatch]);

  // Submissions filtered by class
  const classSubmissions = useMemo(() => {
    if (!selectedClass) return [];
    return dailySubmissions.filter((s) => s.class === selectedClass);
  }, [dailySubmissions, selectedClass]);

  // Get all unique hour/period numbers across selected class submissions, sorted
  const allHours = useMemo(() => {
    const hourSet = new Set<number>();
    classSubmissions.forEach((s) => {
      s.periods.forEach((p) => hourSet.add(p.id));
    });
    return Array.from(hourSet).sort((a, b) => a - b);
  }, [classSubmissions]);

  // Build student-hour grid: for each student, map hourId -> status
  const studentGrid = useMemo(() => {
    // Collect all unique students
    const studentMap = new Map<
      string,
      {
        rollNo: string;
        name: string;
        hours: Map<number, { status: string; subject: string }>;
      }
    >();

    classSubmissions.forEach((s) => {
      const hourIds = s.periods.map((p) => p.id);
      s.attendance.forEach((a) => {
        if (!studentMap.has(a.rollNo)) {
          studentMap.set(a.rollNo, {
            rollNo: a.rollNo,
            name: a.studentName,
            hours: new Map(),
          });
        }
        const student = studentMap.get(a.rollNo)!;
        hourIds.forEach((hId) => {
          student.hours.set(hId, {
            status: a.status,
            subject: s.subjectCode,
          });
        });
      });
    });

    // Sort by roll number
    return Array.from(studentMap.values()).sort((a, b) =>
      a.rollNo.localeCompare(b.rollNo)
    );
  }, [classSubmissions]);

  // Per-class stats for the cards view
  const classStats = useMemo(() => {
    const map = new Map<
      string,
      { sessions: number; present: number; absent: number; onDuty: number; total: number }
    >();
    dailySubmissions.forEach((s) => {
      const cur = map.get(s.class) || { sessions: 0, present: 0, absent: 0, onDuty: 0, total: 0 };
      cur.sessions += 1;
      s.attendance.forEach((a) => {
        cur.total++;
        if (a.status === "Present") cur.present++;
        else if (a.status === "Absent") cur.absent++;
        else if (a.status === "On-Duty") cur.onDuty++;
      });
      map.set(s.class, cur);
    });
    return map;
  }, [dailySubmissions]);

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClassClick = (className: string) => {
    setSelectedClass(className);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setSelectedClass("");
    setCurrentView("classes");
  };

  // Status icon renderer
  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "Present") {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100" title="Present">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }
    if (status === "Absent") {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100" title="Absent">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      );
    }
    if (status === "On-Duty") {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100" title="On-Duty">
          <span className="text-sm font-bold text-blue-600">O</span>
        </span>
      );
    }
    return <span className="inline-flex items-center justify-center w-7 h-7 text-gray-300">—</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {currentView === "detail" && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Classes
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {currentView === "classes"
                ? "Daily Attendance"
                : `Section ${selectedClass}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {adminDeptName || "Department"} — {formatDisplayDate(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Batch:</label>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  setSelectedClass("");
                  setCurrentView("classes");
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* ========== CLASSES VIEW ========== */}
        {currentView === "classes" && (
          <>
            {/* Class Cards Grid */}
            {classes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-400">No classes found</h3>
                <p className="text-sm text-gray-400 mt-1">
                  No classes available for this batch and department.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {classes.map((cls) => {
                  const stats = classStats.get(cls.name);
                  const sessions = stats?.sessions || 0;
                  const present = stats?.present || 0;
                  const absent = stats?.absent || 0;
                  const onDuty = stats?.onDuty || 0;
                  const total = stats?.total || 0;
                  const rate = total > 0 ? (((present + onDuty) / total) * 100).toFixed(1) : null;

                  return (
                    <button
                      key={cls.id}
                      onClick={() => handleClassClick(cls.name)}
                      className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-brand-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mt-3">
                        Section {cls.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {adminDeptId} • {selectedBatch}
                      </p>

                      {sessions > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{sessions} session{sessions > 1 ? "s" : ""}</span>
                            <span className={`font-semibold ${
                              parseFloat(rate || "0") >= 75 ? "text-emerald-600" : parseFloat(rate || "0") >= 50 ? "text-amber-600" : "text-red-600"
                            }`}>
                              {rate}%
                            </span>
                          </div>
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 mt-2">
                            {present > 0 && <div className="bg-emerald-500" style={{ width: `${(present / total) * 100}%` }} />}
                            {onDuty > 0 && <div className="bg-blue-500" style={{ width: `${(onDuty / total) * 100}%` }} />}
                            {absent > 0 && <div className="bg-red-400" style={{ width: `${(absent / total) * 100}%` }} />}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{present}P</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{absent}A</span>
                            {onDuty > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{onDuty}OD</span>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                          No attendance data yet
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ========== DETAIL VIEW: Student × Hour Grid ========== */}
        {currentView === "detail" && (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <StatusIcon status="Present" /> <span>Present</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <StatusIcon status="Absent" /> <span>Absent</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <StatusIcon status="On-Duty" /> <span>On Duty</span>
              </div>
            </div>

            {classSubmissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-400">No attendance recorded</h3>
                <p className="text-sm text-gray-400 mt-1">
                  No sessions found for Section {selectedClass} on {formatDisplayDate(selectedDate)}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Summary bar - on top */}
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Total Students: <span className="font-semibold text-gray-700">{studentGrid.length}</span></span>
                  <span>Sessions: <span className="font-semibold text-gray-700">{classSubmissions.length}</span></span>
                  <span>Hours covered: <span className="font-semibold text-gray-700">{allHours.join(", ")}</span></span>
                </div>

                {/* Hour subject mapping */}
                <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
                  {classSubmissions.map((s) => (
                    <span key={s.id} className="bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Hr {s.periods.map((p) => p.id).join(",")}
                      </span>
                      {" → "}{s.subjectCode} ({s.staffName})
                    </span>
                  ))}
                </div>

                {/* Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/50 z-10 min-w-[60px]">
                          Roll No
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-[60px] bg-gray-50/50 z-10 min-w-[160px]">
                          Student Name
                        </th>
                        {allHours.map((h) => (
                          <th
                            key={h}
                            className="text-center px-2 py-3 text-xs font-bold text-gray-700 min-w-[50px]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {studentGrid.map((student, idx) => (
                        <tr
                          key={student.rollNo}
                          className={`hover:bg-gray-50/50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                        >
                          <td className="px-5 py-2.5 text-xs font-mono text-gray-500 sticky left-0 bg-inherit z-10">
                            {student.rollNo}
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900 sticky left-[60px] bg-inherit z-10">
                            {student.name}
                          </td>
                          {allHours.map((h) => {
                            const entry = student.hours.get(h);
                            return (
                              <td key={h} className="text-center px-2 py-2.5">
                                {entry ? (
                                  <StatusIcon status={entry.status} />
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
