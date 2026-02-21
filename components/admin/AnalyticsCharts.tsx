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
  LineChart,
  Line,
  Legend,
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

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  subjectData,
  statusData,
  trendData,
}) => {
  const COLORS = {
    present: "#13B34A",
    absent: "#E63946",
    onDuty: "#1C8AD5",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Subject-wise Attendance Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 p-5">
        <h3 className="text-sm font-semibold text-neutral-primary mb-4">
          Subject-wise Attendance
        </h3>
        <div className="h-64">
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis type="number" domain={[0, 100]} stroke="#4D4D4D" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={80}
                  stroke="#4D4D4D"
                  fontSize={11}
                  tickFormatter={(value: string) => value.length > 10 ? value.slice(0, 10) + "..." : value}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, "Attendance"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="percentage"
                  fill="#0E8C3A"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-muted">
              No subject data available
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 p-5">
        <h3 className="text-sm font-semibold text-neutral-primary mb-4">
          Status Distribution
        </h3>
        <div className="h-64">
          {statusData.length > 0 && statusData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-muted">
              No status data available
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-neutral-secondary">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Trend Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 p-5 lg:col-span-2 xl:col-span-1">
        <h3 className="text-sm font-semibold text-neutral-primary mb-4">
          Attendance Trend
        </h3>
        <div className="h-64">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="date"
                  stroke="#4D4D4D"
                  fontSize={11}
                  tickFormatter={(value: string) => {
                    const parts = value.split(" ");
                    return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : value;
                  }}
                />
                <YAxis domain={[0, 100]} stroke="#4D4D4D" fontSize={12} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, "Attendance"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#0E8C3A"
                  strokeWidth={2}
                  dot={{ fill: "#0E8C3A", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-muted">
              No trend data available
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
