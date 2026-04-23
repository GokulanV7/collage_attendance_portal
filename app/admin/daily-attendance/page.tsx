"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";

type SubjectOption = {
  code: string;
  name: string;
};

type SubjectStatus = {
  subjectCode: string;
  subjectName: string;
  status: "Marked" | "Not Marked";
  markedBy: string | null;
  markedAt: string | null;
  date: string;
};

type AttendanceDetail = {
  marked: boolean;
  markedBy: string | null;
  date: string;
  section: string;
  subjectCode: string;
  studentAttendance: Array<{
    studentId: string;
    rollNo: string;
    studentName: string;
    status: "Present" | "Absent" | "On-Duty" | "Not Marked";
  }>;
};

type StructureResponse = {
  years: string[];
  departments: string[];
};

const statusPillClass = (status: string) => {
  if (status === "Present") return "bg-emerald-100 text-emerald-700";
  if (status === "Absent") return "bg-red-100 text-red-700";
  if (status === "On-Duty") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-500";
};

const formatDateDisplay = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DailyAttendancePage() {
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );

  const [subjectStatus, setSubjectStatus] = useState<SubjectStatus[]>([]);
  const [attendanceDetail, setAttendanceDetail] = useState<AttendanceDetail | null>(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminDeptId = sessionStorage.getItem("adminDeptId") || "";

    const bootstrap = async () => {
      try {
        const structureRes = await api.getDataStructure();
        const structure = structureRes?.data as StructureResponse;
        const years = structure?.years || [];
        const departments = structure?.departments || [];

        setBatchOptions(years);
        setDepartmentOptions(departments);

        if (years.length > 0) setSelectedBatch(years[0]);

        if (adminDeptId && departments.includes(adminDeptId)) {
          setSelectedDepartment(adminDeptId);
        } else if (departments.length > 0) {
          setSelectedDepartment(departments[0]);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize daily attendance");
      } finally {
        setLoadingInit(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedBatch || !selectedDepartment) return;

    const loadDrilldownData = async () => {
      setLoadingDrilldown(true);
      setError("");
      setSelectedSection("");
      setSelectedSubjectCode("");
      setSubjectStatus([]);
      setAttendanceDetail(null);

      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          api.getAttendanceSections(selectedBatch, selectedDepartment),
          api.getAttendanceSubjects(selectedDepartment),
        ]);

        setSectionOptions(Array.isArray(sectionsRes?.data) ? sectionsRes.data : []);
        setSubjectOptions(Array.isArray(subjectsRes?.data) ? subjectsRes.data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load sections and subjects");
      } finally {
        setLoadingDrilldown(false);
      }
    };

    void loadDrilldownData();
  }, [selectedBatch, selectedDepartment]);

  useEffect(() => {
    if (!selectedBatch || !selectedDepartment || !selectedSection || !selectedDate) return;

    const loadSubjectStatus = async () => {
      try {
        const res = await api.getSubjectAttendanceStatus(
          selectedBatch,
          selectedDepartment,
          selectedSection,
          selectedDate,
        );
        setSubjectStatus(Array.isArray(res?.data) ? res.data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load subject status");
      }
    };

    void loadSubjectStatus();
  }, [selectedBatch, selectedDepartment, selectedSection, selectedDate]);

  useEffect(() => {
    if (!selectedBatch || !selectedDepartment || !selectedSection || !selectedSubjectCode || !selectedDate) {
      setAttendanceDetail(null);
      return;
    }

    const loadAttendanceDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const res = await api.getAttendanceDetail(
          selectedBatch,
          selectedDepartment,
          selectedSection,
          selectedSubjectCode,
          selectedDate,
        );
        setAttendanceDetail((res?.data || null) as AttendanceDetail | null);
      } catch (e: any) {
        setError(e?.message || "Failed to load attendance detail");
        setAttendanceDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    void loadAttendanceDetail();
  }, [selectedBatch, selectedDepartment, selectedSection, selectedSubjectCode, selectedDate]);

  const selectedSubject = useMemo(
    () => subjectOptions.find((s) => s.code === selectedSubjectCode) || null,
    [subjectOptions, selectedSubjectCode],
  );

  const activeSubjectStatus = useMemo(
    () => subjectStatus.find((s) => s.subjectCode === selectedSubjectCode) || null,
    [subjectStatus, selectedSubjectCode],
  );

  const downloadExcel = () => {
    if (!attendanceDetail?.marked) return;

    const exportRows = attendanceDetail.studentAttendance.map((student) => ({
      Batch: selectedBatch,
      Department: selectedDepartment,
      Section: selectedSection,
      Subject: `${selectedSubject?.name || ""} (${selectedSubjectCode})`,
      Date: selectedDate,
      "Marked By": attendanceDetail.markedBy || "",
      "Roll No": student.rollNo,
      "Student Name": student.studentName,
      Status: student.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 30 },
      { wch: 12 },
      { wch: 20 },
      { wch: 14 },
      { wch: 24 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(
      workbook,
      `attendance_${selectedBatch}_${selectedDepartment}_${selectedSection}_${selectedSubjectCode}_${selectedDate}.xlsx`,
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Batch {">"} Department {">"} Section {">"} Subject {">"} Date {">"} Attendance Data
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={loadingInit || loadingDrilldown}
            >
              {batchOptions.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={loadingInit || loadingDrilldown}
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubjectCode("");
                setAttendanceDetail(null);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={loadingDrilldown || sectionOptions.length === 0}
            >
              <option value="">Select section</option>
              {sectionOptions.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={!selectedSection || subjectOptions.length === 0}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.code} value={subject.code}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Subject-wise Status</h2>
            <p className="mt-1 text-xs text-gray-500">For selected section and date</p>

            {!selectedSection ? (
              <p className="mt-5 text-sm text-gray-500">Select section to view subject status.</p>
            ) : subjectStatus.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">No subject data available.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {subjectStatus.map((item) => (
                  <button
                    key={item.subjectCode}
                    type="button"
                    onClick={() => setSelectedSubjectCode(item.subjectCode)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedSubjectCode === item.subjectCode
                        ? "border-brand-secondary bg-brand-primary/10"
                        : "border-gray-200 hover:border-brand-secondary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.subjectName}</p>
                        <p className="text-xs text-gray-500">{item.subjectCode}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === "Marked"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.status === "Marked"
                        ? `Marked by ${item.markedBy || "Unknown"}`
                        : "Not marked yet"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Attendance Data</h2>
            <p className="mt-1 text-xs text-gray-500">
              {selectedDate ? formatDateDisplay(selectedDate) : "Select date"}
            </p>

            {!selectedSection || !selectedSubjectCode ? (
              <p className="mt-5 text-sm text-gray-500">Select section and subject to view attendance.</p>
            ) : loadingDetail ? (
              <p className="mt-5 text-sm text-gray-500">Loading attendance data...</p>
            ) : !attendanceDetail ? (
              <p className="mt-5 text-sm text-gray-500">Attendance not marked yet</p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      attendanceDetail.marked
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {attendanceDetail.marked ? "Marked" : "Not marked yet"}
                  </span>
                  {attendanceDetail.marked && (
                    <span className="text-xs text-gray-600">
                      Marked by <span className="font-semibold">{attendanceDetail.markedBy || "Unknown"}</span>
                    </span>
                  )}
                </div>

                {attendanceDetail.marked && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={downloadExcel}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Download Excel
                    </button>
                  </div>
                )}

                <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Roll No</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Student</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {attendanceDetail.studentAttendance.map((student) => (
                        <tr key={student.studentId}>
                          <td className="px-3 py-2 font-mono text-xs text-gray-700">{student.rollNo}</td>
                          <td className="px-3 py-2 text-gray-800">{student.studentName}</td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(student.status)}`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {attendanceDetail.studentAttendance.length === 0 && (
                  <p className="mt-4 text-sm text-gray-500">No students found for selected section.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
