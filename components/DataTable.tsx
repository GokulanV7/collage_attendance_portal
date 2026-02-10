"use client";

import React, { useState, useMemo } from "react";
import { AttendanceSubmission } from "@/types";
import { getPeriods } from "@/data/mockStaffAndPeriods";

interface DataTableProps {
  data: AttendanceSubmission[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [dateFilter, setDateFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");

  const allPeriods = getPeriods();

  // Flatten data for table rows
  const tableRows = useMemo(() => {
    const rows: any[] = [];
    
    data.forEach((submission) => {
      submission.attendance.forEach((record) => {
        submission.periods.forEach((periodId) => {
          const period = allPeriods.find(p => p.id === periodId);
          rows.push({
            date: submission.date,
            batch: submission.batch,
            department: submission.department,
            class: submission.class,
            period: period?.name || `Period ${periodId}`,
            periodId,
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
  }, [data, allPeriods]);

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
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "On-Duty":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period
          </label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Periods</option>
            {allPeriods.map((period) => (
              <option key={period.id} value={period.id.toString()}>
                {period.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff ID
          </label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
      <div className="text-sm text-gray-600">
        Showing <strong>{filteredRows.length}</strong> records
      </div>

      {/* Google Sheets / Excel Web View Style Table */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse" style={{ borderSpacing: 0 }}>
            <thead>
              <tr className="bg-gradient-to-b from-gray-100 to-gray-200 sticky top-0 shadow-sm">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[120px]">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[120px]">
                  BATCH
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[200px]">
                  DEPARTMENT
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[80px]">
                  CLASS
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[100px]">
                  PERIOD
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[110px]">
                  STAFF ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[180px]">
                  STAFF NAME
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[120px]">
                  ROLL NO
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 border-r border-b-2 border-gray-400 min-w-[180px]">
                  STUDENT NAME
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 border-b-2 border-gray-400 min-w-[120px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500 border-r border-b border-gray-300">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No attendance records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-100 transition-all duration-150 cursor-pointer`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300">
                      {row.batch}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-b border-gray-300">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300 text-center font-bold text-lg">
                      {row.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300">
                      {row.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300 font-mono font-semibold">
                      {row.staffId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-b border-gray-300">
                      {row.staffName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-300 font-mono font-semibold">
                      {row.rollNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-b border-gray-300">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap border-b border-gray-300 text-center">
                      <span
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm ${getStatusColor(
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
