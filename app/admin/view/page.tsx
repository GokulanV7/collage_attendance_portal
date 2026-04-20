"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin";
import { api } from "@/lib/api";

type SubjectOption = {
  code: string;
  name: string;
};

type StudentOverallStats = {
  student_id: string;
  student_name: string;
  roll_no: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
};

type SortField = "name" | "percentage";

type StructureResponse = {
  years: string[];
  departments: string[];
};

const percentClass = (value: number) => {
  if (value < 75) return "text-red-700 bg-red-100";
  if (value < 90) return "text-amber-700 bg-amber-100";
  return "text-emerald-700 bg-emerald-100";
};

export default function AdminViewOverallAttendance() {
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");

  const [stats, setStats] = useState<StudentOverallStats[]>([]);
  const [totalClassesConducted, setTotalClassesConducted] = useState(0);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  const [sortField, setSortField] = useState<SortField>("percentage");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const adminDeptId = sessionStorage.getItem("adminDeptId") || "";

    const loadInitData = async () => {
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
        setError(e?.message || "Failed to initialize overall attendance view");
      } finally {
        setLoadingInit(false);
      }
    };

    void loadInitData();
  }, []);

  useEffect(() => {
    if (!selectedBatch || !selectedDepartment) return;

    const loadFilterData = async () => {
      setLoadingFilters(true);
      setError("");
      setSelectedSection("");
      setSelectedSubjectCode("");
      setStats([]);
      setTotalClassesConducted(0);

      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          api.getAttendanceSections(selectedBatch, selectedDepartment),
          api.getAttendanceSubjects(selectedDepartment),
        ]);

        setSectionOptions(Array.isArray(sectionsRes?.data) ? sectionsRes.data : []);
        setSubjectOptions(Array.isArray(subjectsRes?.data) ? subjectsRes.data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load sections/subjects");
      } finally {
        setLoadingFilters(false);
      }
    };

    void loadFilterData();
  }, [selectedBatch, selectedDepartment]);

  useEffect(() => {
    if (!selectedBatch || !selectedDepartment || !selectedSection || !selectedSubjectCode) {
      setStats([]);
      setTotalClassesConducted(0);
      return;
    }

    const loadOverallStats = async () => {
      setLoadingStats(true);
      setError("");
      try {
        const res = await api.getOverallAttendanceStats(
          selectedBatch,
          selectedDepartment,
          selectedSection,
          selectedSubjectCode,
        );

        setStats(Array.isArray(res?.data?.students) ? res.data.students : []);
        setTotalClassesConducted(Number(res?.data?.total_classes_conducted || 0));
      } catch (e: any) {
        setError(e?.message || "Failed to load overall attendance stats");
        setStats([]);
        setTotalClassesConducted(0);
      } finally {
        setLoadingStats(false);
      }
    };

    void loadOverallStats();
  }, [selectedBatch, selectedDepartment, selectedSection, selectedSubjectCode]);

  const selectedSubject = useMemo(
    () => subjectOptions.find((subject) => subject.code === selectedSubjectCode) || null,
    [selectedSubjectCode, subjectOptions],
  );

  const sortedStats = useMemo(() => {
    const next = [...stats];
    next.sort((a, b) => {
      if (sortField === "name") {
        const result = a.student_name.localeCompare(b.student_name);
        return sortAsc ? result : -result;
      }
      const result = a.attendance_percentage - b.attendance_percentage;
      return sortAsc ? result : -result;
    });
    return next;
  }, [stats, sortField, sortAsc]);

  const lowAttendanceCount = useMemo(
    () => stats.filter((student) => student.attendance_percentage < 75).length,
    [stats],
  );

  const avgAttendance = useMemo(() => {
    if (stats.length === 0) return 0;
    const sum = stats.reduce((acc, student) => acc + student.attendance_percentage, 0);
    return Number((sum / stats.length).toFixed(2));
  }, [stats]);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortAsc((prev) => !prev);
      return;
    }
    setSortField(field);
    setSortAsc(field === "name");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Dashboard &gt; Attendance &gt; {selectedSection || "Section"} &gt; {selectedSubject?.name || "Subject"}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Overall Attendance Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Batch -&gt; Department -&gt; Section -&gt; Subject -&gt; Overall Stats
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={loadingInit || loadingFilters}
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
              disabled={loadingInit || loadingFilters}
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
                setStats([]);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-secondary focus:outline-none"
              disabled={loadingFilters || sectionOptions.length === 0}
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
              onChange={(e) => {
                setSelectedSubjectCode(e.target.value);
                setStats([]);
              }}
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
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Classes Conducted</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalClassesConducted}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Average Attendance</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{avgAttendance}%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Low Attendance (&lt;75%)</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{lowAttendanceCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Student-wise Overall Stats</h2>
              <p className="text-xs text-gray-500">Backend aggregated analytics view</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  sortField === "name"
                    ? "border-brand-secondary bg-brand-primary/10 text-brand-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Sort Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : ""}
              </button>
              <button
                type="button"
                onClick={() => toggleSort("percentage")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  sortField === "percentage"
                    ? "border-brand-secondary bg-brand-primary/10 text-brand-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Sort % {sortField === "percentage" ? (sortAsc ? "↑" : "↓") : ""}
              </button>
            </div>
          </div>

          {!selectedSection || !selectedSubjectCode ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              Select batch, department, section and subject to view analytics.
            </div>
          ) : loadingStats ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">Loading overall stats...</div>
          ) : sortedStats.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No attendance data found. Mark attendance first to see analytics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Student Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Total Classes</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Present</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Absent</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {sortedStats.map((student) => {
                    const isLow = student.attendance_percentage < 75;
                    return (
                      <tr key={student.student_id} className={isLow ? "bg-red-50/40" : ""}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{student.student_name}</div>
                          <div className="text-xs text-gray-500">{student.roll_no}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{student.total_classes}</td>
                        <td className="px-4 py-3 text-emerald-700">{student.present_count}</td>
                        <td className="px-4 py-3 text-red-700">{student.absent_count}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${percentClass(student.attendance_percentage)}`}>
                            {student.attendance_percentage}%
                          </span>
                          {isLow && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Low Attendance
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
