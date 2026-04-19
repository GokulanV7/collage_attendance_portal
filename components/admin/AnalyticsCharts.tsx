"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

interface SubjectAttendance {
  subject: string;
  percentage: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface DateTrend {
  date: string;
  attendance: number;
}

interface AnalyticsChartsProps {
  subjectData: SubjectAttendance[];
  statusData: StatusDistribution[];
  trendData: DateTrend[];
}

// Custom tooltip component for better visuals
const CustomTooltip = ({ active, payload, label, suffix = "%" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-900">
          {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

// Custom legend for pie chart
const CustomPieLegend = ({ statusData }: { statusData: StatusDistribution[] }) => (
  <div className="flex justify-center gap-6 mt-4">
    {statusData.map((item) => (
      <div key={item.name} className="flex items-center gap-2 group cursor-pointer">
        <div
          className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-125"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
          {item.name}
        </span>
        <span className="text-sm font-bold text-gray-900">({item.value})</span>
      </div>
    ))}
  </div>
);

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  subjectData,
  statusData,
  trendData,
}) => {
  // Calculate total for percentage display
  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Subject-wise Attendance Bar Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Subject Performance
            </h3>
            <p className="text-xs text-gray-500 mt-1">Attendance by subject</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="h-72">
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={90}
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => value.length > 12 ? value.slice(0, 12) + "…" : value}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                <Bar
                  dataKey="percentage"
                  fill="#10B981"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  animationDuration={1000}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No subject data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Status Distribution
            </h3>
            <p className="text-xs text-gray-500 mt-1">Overall attendance breakdown</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>
        <div className="h-56">
          {statusData.length > 0 && statusData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                  </filter>
                </defs>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={0}
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: 'url(#shadow)' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">{data.name}</p>
                          <p className="text-lg font-bold" style={{ color: data.color }}>
                            {data.value} <span className="text-sm font-normal text-gray-500">({percent}%)</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
              <p className="text-sm">No status data available</p>
            </div>
          )}
        </div>
        {/* Enhanced Legend */}
        {statusData.length > 0 && statusData.some((d) => d.value > 0) && (
          <CustomPieLegend statusData={statusData} />
        )}
      </div>

      {/* Attendance Trend Area Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 lg:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Attendance Trend
            </h3>
            <p className="text-xs text-gray-500 mt-1">Last 7 days performance</p>
          </div>
          <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="h-72">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => {
                    const parts = value.split(" ");
                    return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : value;
                  }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                  animationDuration={1000}
                  animationBegin={0}
                  dot={{ fill: "#7C3AED", strokeWidth: 0, r: 4 }}
                  activeDot={{ 
                    r: 6, 
                    fill: "#7C3AED", 
                    stroke: "#fff", 
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-sm">No trend data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility function to calculate chart data from submissions
export const calculateChartData = (
  submissions: {
    subject: string;
    date: string;
    attendance: { status: "Present" | "Absent" | "On-Duty" }[];
  }[]
) => {
  // Subject-wise attendance
  const subjectMap = new Map<string, { present: number; total: number }>();
  submissions.forEach((sub) => {
    if (!sub.subject) return;
    const current = subjectMap.get(sub.subject) || { present: 0, total: 0 };
    sub.attendance.forEach((a) => {
      current.total++;
      if (a.status === "Present" || a.status === "On-Duty") {
        current.present++;
      }
    });
    subjectMap.set(sub.subject, current);
  });

  const subjectData: SubjectAttendance[] = Array.from(subjectMap.entries())
    .map(([subject, data]) => ({
      subject,
      percentage: data.total > 0 ? (data.present / data.total) * 100 : 0,
    }))
    .slice(0, 6);

  // Status distribution
  let presentCount = 0;
  let absentCount = 0;
  let onDutyCount = 0;

  submissions.forEach((sub) => {
    sub.attendance.forEach((a) => {
      if (a.status === "Present") presentCount++;
      else if (a.status === "Absent") absentCount++;
      else if (a.status === "On-Duty") onDutyCount++;
    });
  });

  const statusData: StatusDistribution[] = [
    { name: "Present", value: presentCount, color: "#13B34A" },
    { name: "Absent", value: absentCount, color: "#E63946" },
    { name: "On-Duty", value: onDutyCount, color: "#1C8AD5" },
  ];

  // Date trend
  const dateMap = new Map<string, { present: number; total: number }>();
  submissions.forEach((sub) => {
    const current = dateMap.get(sub.date) || { present: 0, total: 0 };
    sub.attendance.forEach((a) => {
      current.total++;
      if (a.status === "Present" || a.status === "On-Duty") {
        current.present++;
      }
    });
    dateMap.set(sub.date, current);
  });

  const trendData: DateTrend[] = Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      attendance: data.total > 0 ? (data.present / data.total) * 100 : 0,
    }))
    .slice(-7);

  return { subjectData, statusData, trendData };
};
