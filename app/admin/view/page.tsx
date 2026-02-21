'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useAttendance } from "@/context/AttendanceContext";
import { AttendanceSubmission, AttendanceStatus } from "@/types";

interface FlattenedRow {
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
  status: AttendanceStatus;
}

const statusChip = (status: AttendanceStatus) => {
  const map: Record<AttendanceStatus, string> = {
    Present: "bg-status-successSoft text-status-successStrong",
    Absent: "bg-status-dangerSoft text-status-dangerStrong",
    "On-Duty": "bg-status-infoSoft text-status-infoStrong",
  };
  return map[status];
};

export default function AdminView() {
  const router = useRouter();
  const { submissions } = useAttendance();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminDeptName, setAdminDeptName] = useState("");
  const [filters, setFilters] = useState({
    batch: "",
    className: "",
    semester: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    const deptName = sessionStorage.getItem("adminDeptName") || "";
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    setAdminDeptName(deptName);
    setIsAuthorized(true);
  }, [router]);

  const deptSubmissions = useMemo(() => {
    return submissions.filter((sub) => sub.department === adminDeptName);
  }, [submissions, adminDeptName]);

  const rows: FlattenedRow[] = useMemo(() => {
    const flat: FlattenedRow[] = [];
    deptSubmissions.forEach((submission) => {
      submission.attendance.forEach((record) => {
        submission.periods.forEach((period) => {
          flat.push({
            date: submission.date,
            batch: submission.batch,
            department: submission.department,
            className: submission.class,
            semester: submission.semester,
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

  const batchOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.batch))),
    [deptSubmissions]
  );

  const classOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.class))),
    [deptSubmissions]
  );

  const semesterOptions = useMemo(
    () => Array.from(new Set(deptSubmissions.map((s) => s.semester).filter(Boolean))),
    [deptSubmissions]
  );

  useEffect(() => {
    if (batchOptions.length && !filters.batch) {
      setFilters((prev) => ({ ...prev, batch: batchOptions[0] }));
    }
    if (classOptions.length && !filters.className) {
      setFilters((prev) => ({ ...prev, className: classOptions[0] }));
    }
    if (semesterOptions.length && !filters.semester) {
      setFilters((prev) => ({ ...prev, semester: semesterOptions[0] }));
    }
  }, [batchOptions, classOptions, semesterOptions, filters.batch, filters.className, filters.semester]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.batch && row.batch !== filters.batch) return false;
      if (filters.className && row.className !== filters.className) return false;
      if (filters.semester && row.semester !== filters.semester) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (
        filters.search &&
        !`${row.studentName} ${row.rollNo}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, filters]);

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    filteredRows.forEach((row) => {
      const key = row.rollNo;
      const current = map.get(key) || { present: 0, total: 0 };
      map.set(key, {
        present: current.present + (row.status === "Present" ? 1 : 0),
        total: current.total + 1,
      });
    });
    return map;
  }, [filteredRows]);

  const totalStudents = uniqueStudents.size;
  const workingDays = new Set(filteredRows.map((r) => r.date)).size;
  const presentCount = filteredRows.filter((r) => r.status === "Present").length;
  const totalCount = filteredRows.length || 1;
  const classAverage = Math.round((presentCount / totalCount) * 1000) / 10;

  let below75 = 0;
  let below65 = 0;
  uniqueStudents.forEach((value) => {
    const pct = value.total ? (value.present / value.total) * 100 : 0;
    if (pct < 65) below65 += 1;
    if (pct < 75) below75 += 1;
  });

  const statusCounts = {
    Present: filteredRows.filter((r) => r.status === "Present").length,
    Absent: filteredRows.filter((r) => r.status === "Absent").length,
    "On-Duty": filteredRows.filter((r) => r.status === "On-Duty").length,
  };

  const headerFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <p className="text-xs text-neutral-secondary mb-1">Academic Year</p>
        <select
          value={filters.batch}
          onChange={(e) => setFilters((prev) => ({ ...prev, batch: e.target.value }))}
          className="w-full rounded-xl border border-neutral-border bg-brand-surface px-3 py-2 text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        >
          {batchOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs text-neutral-secondary mb-1">Class / Section</p>
        <select
          value={filters.className}
          onChange={(e) => setFilters((prev) => ({ ...prev, className: e.target.value }))}
          className="w-full rounded-xl border border-neutral-border bg-brand-surface px-3 py-2 text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        >
          {classOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs text-neutral-secondary mb-1">Semester</p>
        <select
          value={filters.semester}
          onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
          className="w-full rounded-xl border border-neutral-border bg-brand-surface px-3 py-2 text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        >
          {semesterOptions.map((opt) => (
            <option key={opt} value={opt}>{`Semester ${opt}`}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs text-neutral-secondary mb-1">Status</p>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="w-full rounded-xl border border-neutral-border bg-brand-surface px-3 py-2 text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        >
          <option value="">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="On-Duty">On-Duty</option>
        </select>
      </div>
    </div>
  );

  if (!isAuthorized) return null;

  const hasData = deptSubmissions.length > 0 && rows.length > 0;

  return (
    <PageLayout
      title="Attendance Overview"
      subtitle={adminDeptName ? `${adminDeptName} • Admin Panel` : "Admin Panel"}
    >
      <div className="space-y-6">
        <Card className="shadow-sm border border-brand-primary/30 bg-brand-background">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs text-neutral-secondary">Active Filters</p>
              <h3 className="text-lg font-semibold text-neutral-primary">Configure your view</h3>
            </div>
            <div className="flex flex-col gap-3 md:w-2/3">
              {headerFilters}
            </div>
          </div>
        </Card>

        {!hasData && (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-neutral-primary mb-2">No records yet</h3>
            <p className="text-neutral-secondary mb-6">
              Attendance submissions for this department will appear here once staff submit them.
            </p>
            <Link href="/staff/validate">
              <Button>Go to Staff Portal</Button>
            </Link>
          </Card>
        )}

        {hasData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-brand-primarySoft border border-brand-primary/40">
                <p className="text-xs text-brand-secondary">Total Students</p>
                <p className="text-3xl font-bold text-brand-secondary mt-2">{totalStudents}</p>
              </Card>
              <Card className="bg-brand-background border border-neutral-border">
                <p className="text-xs text-neutral-secondary">Working Days</p>
                <p className="text-3xl font-bold text-neutral-primary mt-2">{workingDays}</p>
              </Card>
              <Card className="bg-brand-surface border border-neutral-border">
                <p className="text-xs text-neutral-secondary">Class Average</p>
                <p className="text-3xl font-bold text-status-successStrong mt-2">{classAverage}%</p>
              </Card>
              <Card className="bg-status-infoSoft border border-status-info/60">
                <p className="text-xs text-status-infoStrong">Students &lt; 75%</p>
                <p className="text-3xl font-bold text-status-infoStrong mt-2">{below75}</p>
              </Card>
              <Card className="bg-status-dangerSoft border border-status-danger/60">
                <p className="text-xs text-status-dangerStrong">Students &lt; 65%</p>
                <p className="text-3xl font-bold text-status-dangerStrong mt-2">{below65}</p>
              </Card>
            </div>

            <Card className="border border-neutral-border">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        placeholder="Search students or roll no"
                        className="w-72 rounded-xl border border-neutral-border bg-brand-background px-4 py-2 text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                      />
                    </div>
                    <div className="flex gap-2 text-xs text-neutral-secondary">
                      <span className="px-3 py-1 rounded-full bg-status-successSoft text-status-successStrong">Present {statusCounts.Present}</span>
                      <span className="px-3 py-1 rounded-full bg-status-dangerSoft text-status-dangerStrong">Absent {statusCounts.Absent}</span>
                      <span className="px-3 py-1 rounded-full bg-status-infoSoft text-status-infoStrong">On-Duty {statusCounts["On-Duty"]}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}>Clear Search</Button>
                    <Button onClick={() => window.print()}>Export / Print</Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-brand-primarySoft text-brand-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Student Name</th>
                        <th className="px-4 py-3 text-left">Roll No</th>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Semester</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Period</th>
                        <th className="px-4 py-3 text-left">Staff</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-neutral-secondary">No matching records</td>
                        </tr>
                      )}
                      {filteredRows.map((row, idx) => (
                        <tr key={`${row.rollNo}-${idx}`} className={idx % 2 === 0 ? "bg-brand-background" : "bg-brand-surface"}>
                          <td className="px-4 py-3 font-medium text-neutral-primary">{row.studentName}</td>
                          <td className="px-4 py-3 font-mono text-xs text-neutral-muted">{row.rollNo}</td>
                          <td className="px-4 py-3 text-neutral-primary">{row.className}</td>
                          <td className="px-4 py-3 text-neutral-primary">{row.semester ? `Sem ${row.semester}` : "-"}</td>
                          <td className="px-4 py-3 text-neutral-primary">{row.date}</td>
                          <td className="px-4 py-3 text-neutral-primary">{row.period}</td>
                          <td className="px-4 py-3 text-neutral-primary">{row.staffName} ({row.staffId})</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="secondary">Back to Home</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
