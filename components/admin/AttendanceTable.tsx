"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AttendanceStatus } from "@/types";

export interface TableRow {
  date: string;
  batch: string;
  department: string;
  className: string;
  semester: string;
  subject: string;
  period: string;
  staffId: string;
  staffName: string;
  rollNo: string;
  studentName: string;
  status: AttendanceStatus;
  attendancePercent?: number;
}

interface AttendanceTableProps {
  data: TableRow[];
  pageSize?: number;
}

type SortKey = keyof TableRow;
type SortOrder = "asc" | "desc";

const statusBadge = (status: AttendanceStatus) => {
  const styles: Record<AttendanceStatus, string> = {
    Present: "bg-status-successSoft text-status-successStrong",
    Absent: "bg-status-dangerSoft text-status-dangerStrong",
    "On-Duty": "bg-status-infoSoft text-status-infoStrong",
  };
  return styles[status];
};

const getAttendanceColor = (percent: number) => {
  if (percent >= 75) return "text-status-success";
  if (percent >= 65) return "text-status-warning";
  return "text-status-danger";
};

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  pageSize = 15,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return (
        <svg className="w-4 h-4 text-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={sortOrder === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
        />
      </svg>
    );
  };

  const columns: { key: SortKey; label: string; sortable: boolean }[] = [
    { key: "studentName", label: "Student", sortable: true },
    { key: "rollNo", label: "Roll No", sortable: true },
    { key: "className", label: "Class", sortable: true },
    { key: "semester", label: "Sem", sortable: true },
    { key: "subject", label: "Subject", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "period", label: "Period", sortable: false },
    { key: "staffName", label: "Staff", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "attendancePercent", label: "Att %", sortable: true },
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-neutral-primary mb-2">No Records Found</h3>
        <p className="text-neutral-secondary">Attendance records will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-neutral-secondary uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? "cursor-pointer hover:bg-gray-100 select-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border/50">
            {paginatedData.map((row, idx) => (
              <tr
                key={`${row.rollNo}-${row.date}-${row.period}-${idx}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/student/${row.rollNo}`}
                    className="font-medium text-neutral-primary hover:text-brand-secondary transition-colors"
                  >
                    {row.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-secondary">
                  {row.rollNo}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary">
                  {row.className}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary">
                  {row.semester ? `${row.semester}` : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary max-w-[150px] truncate" title={row.subject}>
                  {row.subject || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary whitespace-nowrap">
                  {row.date}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary">
                  {row.period}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-primary">
                  <span className="block">{row.staffName}</span>
                  <span className="text-xs text-neutral-muted">{row.staffId}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.attendancePercent !== undefined ? (
                    <span className={`font-semibold ${getAttendanceColor(row.attendancePercent)}`}>
                      {row.attendancePercent.toFixed(1)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-neutral-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-neutral-secondary">
          Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
          <span className="font-medium">{Math.min(startIndex + pageSize, sortedData.length)}</span> of{" "}
          <span className="font-medium">{sortedData.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-border bg-white text-neutral-secondary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-border bg-white text-neutral-secondary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-brand-secondary text-white"
                      : "bg-white border border-neutral-border text-neutral-secondary hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral-border bg-white text-neutral-secondary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral-border bg-white text-neutral-secondary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
