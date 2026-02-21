'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { useAttendance } from '@/context/AttendanceContext';
import { safeSessionStorage } from '@/utils/safeSessionStorage';
import { staffData } from '@/data/mockStaffAndPeriods';

interface StaffReport {
  staffId: string;
  staffName: string;
  department: string;
  totalClasses: number;
  totalStudents: number;
  totalPresent: number;
  avgAttendance: number;
  mostConductedSubject: string;
  subjectCount: Record<string, number>;
}

export default function StaffReportPage() {
  const router = useRouter();
  const { submissions } = useAttendance();
  const [adminDept, setAdminDept] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'classes' | 'attendance'>('classes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const isAdmin = safeSessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }
    const dept = safeSessionStorage.getItem('adminDeptId') || 'Overall';
    setAdminDept(dept);
  }, [router]);

  const staffReports = useMemo(() => {
    const reportMap = new Map<string, StaffReport>();

    // Initialize all staff
    staffData.forEach((staff) => {
      reportMap.set(staff.id, {
        staffId: staff.id,
        staffName: staff.name,
        department: staff.department,
        totalClasses: 0,
        totalStudents: 0,
        totalPresent: 0,
        avgAttendance: 0,
        mostConductedSubject: '-',
        subjectCount: {},
      });
    });

    // Process submissions
    submissions.forEach((submission) => {
      const staffId = submission.staffId;
      const staff = reportMap.get(staffId);
      if (staff) {
        staff.totalClasses++;
        staff.totalStudents += submission.attendance.length;
        staff.totalPresent += submission.attendance.filter((s) => s.status === 'Present').length;

        const subject = submission.subject || 'Unknown';
        staff.subjectCount[subject] = (staff.subjectCount[subject] || 0) + 1;
      }
    });

    // Calculate derived values
    reportMap.forEach((report) => {
      if (report.totalStudents > 0) {
        report.avgAttendance = Math.round((report.totalPresent / report.totalStudents) * 100);
      }

      // Find most conducted subject
      let maxCount = 0;
      Object.entries(report.subjectCount).forEach(([subject, count]) => {
        if (count > maxCount) {
          maxCount = count;
          report.mostConductedSubject = subject;
        }
      });
    });

    return Array.from(reportMap.values());
  }, [submissions]);

  const filteredReports = useMemo(() => {
    let filtered = staffReports;

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((r) => r.department === selectedDepartment);
    }

    // Filter by admin department if not HOD/Overall
    if (adminDept && adminDept !== 'Overall') {
      filtered = filtered.filter((r) => r.department === adminDept);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.staffName.localeCompare(b.staffName);
      } else if (sortBy === 'classes') {
        comparison = a.totalClasses - b.totalClasses;
      } else {
        comparison = a.avgAttendance - b.avgAttendance;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [staffReports, selectedDepartment, adminDept, sortBy, sortOrder]);

  const departments = useMemo(() => {
    const depts = new Set(staffData.map((s) => s.department));
    return Array.from(depts);
  }, []);

  const handleSort = (column: 'name' | 'classes' | 'attendance') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: 'name' | 'classes' | 'attendance') => {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    const headers = ['Staff ID', 'Name', 'Department', 'Total Classes', 'Avg Attendance %', 'Most Conducted Subject'];
    const rows = filteredReports.map((r) => [
      r.staffId,
      r.staffName,
      r.department,
      r.totalClasses,
      r.avgAttendance,
      r.mostConductedSubject,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!adminDept) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-[#D5F000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {adminDept === 'Overall' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
              >
                <option value="name">Name</option>
                <option value="classes">Classes Taken</option>
                <option value="attendance">Avg Attendance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('classes')}
                  >
                    Total Classes {getSortIcon('classes')}
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('attendance')}
                  >
                    Avg Attendance {getSortIcon('attendance')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Most Conducted Subject
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.staffId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {report.staffId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {report.staffName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium text-gray-900">{report.staffName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {report.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-semibold ${report.totalClasses > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {report.totalClasses}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {report.totalClasses > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${report.avgAttendance}%`,
                                  backgroundColor:
                                    report.avgAttendance >= 85
                                      ? '#0E8C3A'
                                      : report.avgAttendance >= 75
                                      ? '#EAB308'
                                      : '#DC2626',
                                }}
                              />
                            </div>
                            <span className="font-medium text-gray-900">{report.avgAttendance}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {report.mostConductedSubject}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No staff records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
