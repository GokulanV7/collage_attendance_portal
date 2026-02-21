'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { AdminLayout } from '@/components/admin';
import { useAttendance } from '@/context/AttendanceContext';
import { safeSessionStorage } from '@/utils/safeSessionStorage';
import { AttendanceSubmission } from '@/types';

interface SubjectAttendance {
  subject: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  attendance: number;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rollNo = params.rollNo as string;
  const { submissions } = useAttendance();

  const [studentData, setStudentData] = useState<{
    name: string;
    rollNo: string;
    department: string;
    batch: string;
    class: string;
    semester: string;
    records: AttendanceSubmission[];
  } | null>(null);

  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectAttendance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  useEffect(() => {
    const isAdmin = safeSessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }
    const adminDept = safeSessionStorage.getItem('adminDeptId') || 'Overall';

    // Find all records for this student
    const studentRecords: AttendanceSubmission[] = [];
    let studentInfo = {
      name: '',
      department: '',
      batch: '',
      class: '',
      semester: '',
    };

    submissions.forEach((submission) => {
      submission.attendance.forEach((record) => {
        if (record.rollNo === rollNo) {
          studentRecords.push(submission);
          if (!studentInfo.name) {
            studentInfo = {
              name: record.studentName,
              department: submission.department,
              batch: submission.batch,
              class: submission.class,
              semester: submission.semester,
            };
          }
        }
      });
    });

    if (studentRecords.length === 0) {
      return;
    }

    setStudentData({
      ...studentInfo,
      rollNo,
      records: studentRecords,
    });

    // Calculate subject breakdown
    const subjectMap = new Map<string, { present: number; total: number }>();
    studentRecords.forEach((record) => {
      const subject = record.subject || 'Unknown';
      const student = record.attendance.find((s) => s.rollNo === rollNo);
      if (student) {
        const existing = subjectMap.get(subject) || { present: 0, total: 0 };
        subjectMap.set(subject, {
          present: existing.present + (student.status === 'Present' ? 1 : 0),
          total: existing.total + 1,
        });
      }
    });

    const breakdown: SubjectAttendance[] = Array.from(subjectMap.entries()).map(
      ([subject, data]) => ({
        subject,
        present: data.present,
        absent: data.total - data.present,
        total: data.total,
        percentage: Math.round((data.present / data.total) * 100),
      })
    );
    setSubjectBreakdown(breakdown);

    // Calculate monthly data
    const monthMap = new Map<string, { present: number; total: number }>();
    studentRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const student = record.attendance.find((s) => s.rollNo === rollNo);
      if (student) {
        const existing = monthMap.get(monthKey) || { present: 0, total: 0 };
        monthMap.set(monthKey, {
          present: existing.present + (student.status === 'Present' ? 1 : 0),
          total: existing.total + 1,
        });
      }
    });

    const monthly: MonthlyData[] = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        attendance: Math.round((data.present / data.total) * 100),
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        return aYear === bYear
          ? new Date(`${aMonth} 1`).getMonth() - new Date(`${bMonth} 1`).getMonth()
          : parseInt(aYear) - parseInt(bYear);
      });
    setMonthlyData(monthly);

    // Calculate overall stats
    let totalPresent = 0;
    let totalClasses = 0;
    studentRecords.forEach((record) => {
      const student = record.attendance.find((s) => s.rollNo === rollNo);
      if (student) {
        totalClasses++;
        if (student.status === 'Present') totalPresent++;
      }
    });

    setOverallStats({
      totalClasses,
      present: totalPresent,
      absent: totalClasses - totalPresent,
      percentage: totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0,
    });
  }, [submissions, rollNo, router]);

  const getRiskStatus = (percentage: number) => {
    if (percentage >= 85) return { label: 'Safe', color: 'bg-green-100 text-green-700 border-green-300' };
    if (percentage >= 75) return { label: 'Warning', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { label: 'At Risk', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 85) return '#0E8C3A';
    if (percentage >= 75) return '#EAB308';
    return '#DC2626';
  };

  if (!studentData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D5F000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const riskStatus = getRiskStatus(overallStats.percentage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/view')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {studentData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{studentData.name}</h1>
                <p className="text-gray-600">Roll No: {studentData.rollNo}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    {studentData.department}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    Batch {studentData.batch}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    {studentData.class}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    Sem {studentData.semester}
                  </span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${riskStatus.color} font-medium`}>
              {riskStatus.label}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{overallStats.totalClasses}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{overallStats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{overallStats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className={`text-3xl font-bold ${
              overallStats.percentage >= 85 ? 'text-green-600' :
              overallStats.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallStats.percentage}%
            </div>
            <div className="text-sm text-gray-600">Attendance</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject-wise Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h2>
            {subjectBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectBreakdown} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="subject" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Attendance']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {subjectBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No subject data available
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Attendance']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#0E8C3A"
                    strokeWidth={3}
                    dot={{ fill: '#0E8C3A', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#D5F000', stroke: '#0E8C3A', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No monthly data available
              </div>
            )}
          </div>
        </div>

        {/* Subject Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Subject-wise Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectBreakdown.length > 0 ? (
                  subjectBreakdown.map((subject, index) => {
                    const status = getRiskStatus(subject.percentage);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {subject.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                          {subject.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-medium">
                          {subject.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-medium">
                          {subject.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${subject.percentage}%`,
                                  backgroundColor: getBarColor(subject.percentage),
                                }}
                              />
                            </div>
                            <span className="font-medium text-gray-900">{subject.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No attendance records found for this student
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
