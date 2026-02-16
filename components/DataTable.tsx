"use client";

import React, { useState, useMemo } from "react";
import { AttendanceSubmission } from "@/types";

interface DataTableProps {
  data: AttendanceSubmission[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [dateFilter, setDateFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");

  // Flatten data for table rows
  const tableRows = useMemo(() => {
    const rows: any[] = [];
    
    data.forEach((submission) => {
      submission.attendance.forEach((record) => {
        submission.periods.forEach((period) => {
          rows.push({
            date: submission.date,
            batch: submission.batch,
            department: submission.department,
            class: submission.class,
            period: period.name,
            periodId: period.id,
            staffId: submission.staffId,
            staffName: submission.staffName,
            rollNo: record.rollNo,
            studentName: record.studentName,
            status: record.status,
          });
        });
      });
    });

    return rows;
  }, [data]);

  // Get unique periods from the data
  const uniquePeriods = useMemo(() => {
    const periodMap = new Map();
    tableRows.forEach(row => {
      if (!periodMap.has(row.periodId)) {
        periodMap.set(row.periodId, row.period);
      }
    });
    return Array.from(periodMap.entries()).map(([id, name]) => ({ id, name }));
  }, [tableRows]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (dateFilter && !row.date.toLowerCase().includes(dateFilter.toLowerCase())) return false;
      if (periodFilter && row.periodId.toString() !== periodFilter) return false;
      if (classFilter && !row.class.toLowerCase().includes(classFilter.toLowerCase())) return false;
      if (staffFilter && !row.staffId.toLowerCase().includes(staffFilter.toLowerCase())) return false;
      return true;
    });
  }, [tableRows, dateFilter, periodFilter, classFilter, staffFilter]);

  // Get unique values for filters
  const uniqueDates = Array.from(new Set(tableRows.map(r => r.date)));
  const uniqueClasses = Array.from(new Set(tableRows.map(r => r.class)));
  const uniqueStaff = Array.from(new Set(tableRows.map(r => r.staffId)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-status-successSoft text-status-successStrong";
      case "Absent":
        return "bg-status-dangerSoft text-status-dangerStrong";
      case "On-Duty":
        return "bg-status-infoSoft text-status-infoStrong";
      default:
        return "bg-pastel-blue text-neutral-secondary";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-brand-surface shadow-sm border border-neutral-border rounded-2xl">
        <div>
          <label className="block text-sm font-medium text-neutral-secondary mb-1">
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-xl bg-brand-surface text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option value="">All Dates</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-secondary mb-1">
            Period
          </label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-xl bg-brand-surface text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option value="">All Periods</option>
            {uniquePeriods.map((period) => (
              <option key={period.id} value={period.id.toString()}>
                {period.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-secondary mb-1">
            Class
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-xl bg-brand-surface text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-secondary mb-1">
            Staff ID
          </label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-xl bg-brand-surface text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option value="">All Staff</option>
            {uniqueStaff.map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-neutral-secondary">
        Showing <strong>{filteredRows.length}</strong> records
      </div>

      {/* Table */}
      <div className="bg-brand-surface overflow-hidden border border-neutral-border rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse" style={{ borderSpacing: 0 }}>
            <thead>
              <tr className="bg-brand-primarySoft text-brand-secondary sticky top-0">
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[120px]">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[120px]">
                  BATCH
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[200px]">
                  DEPARTMENT
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[80px]">
                  CLASS
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[100px]">
                  PERIOD
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[110px]">
                  STAFF ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[180px]">
                  STAFF NAME
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[120px]">
                  ROLL NO
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold border-r border-b-2 border-neutral-border/70 min-w-[180px]">
                  STUDENT NAME
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold border-b-2 border-neutral-border/70 min-w-[120px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-neutral-muted border-r border-b border-neutral-border">
                    <p className="text-base">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`${
                      index % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-background'
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-neutral-muted whitespace-nowrap border-r border-b border-neutral-border">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-primary whitespace-nowrap border-r border-b border-neutral-border">
                      {row.batch}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-primary border-r border-b border-neutral-border">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-b border-neutral-border text-center font-bold text-lg text-neutral-primary">
                      {row.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-primary whitespace-nowrap border-r border-b border-neutral-border">
                      {row.period}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-muted whitespace-nowrap border-r border-b border-neutral-border">
                      {row.staffId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-primary border-r border-b border-neutral-border">
                      {row.staffName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-muted whitespace-nowrap border-r border-b border-neutral-border">
                      {row.rollNo}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-primary border-r border-b border-neutral-border">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap border-b border-neutral-border text-center">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase ${getStatusColor(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
