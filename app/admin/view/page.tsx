"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import { useAttendance } from "@/context/AttendanceContext";

export default function AdminView() {
  const router = useRouter();
  const { submissions } = useAttendance();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) return null;

  const totalRecords = submissions.reduce(
    (sum, sub) => sum + sub.attendance.length * sub.periods.length,
    0
  );
  const presentCount = submissions.reduce((sum, sub) => {
    return (
      sum +
      sub.attendance.filter((a) => a.status === "Present").length *
        sub.periods.length
    );
  }, 0);
  const absentCount = submissions.reduce((sum, sub) => {
    return (
      sum +
      sub.attendance.filter((a) => a.status === "Absent").length *
        sub.periods.length
    );
  }, 0);
  const onDutyCount = submissions.reduce((sum, sub) => {
    return (
      sum +
      sub.attendance.filter((a) => a.status === "On-Duty").length *
        sub.periods.length
    );
  }, 0);

  return (
    <PageLayout
      title="Attendance Records"
      subtitle="View and filter all attendance submissions"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <p className="text-sm text-primary-700 font-medium">
              Total Submissions
            </p>
            <p className="text-3xl font-bold text-primary-900">
              {submissions.length}
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-700 font-medium">Total Records</p>
            <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-sm text-green-700 font-medium">Present</p>
            <p className="text-3xl font-bold text-green-900">{presentCount}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <p className="text-sm text-red-700 font-medium">Absent</p>
            <p className="text-3xl font-bold text-red-900">{absentCount}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-sm text-blue-700 font-medium">On-Duty</p>
            <p className="text-3xl font-bold text-blue-900">{onDutyCount}</p>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      {submissions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Attendance Records Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Teachers haven't submitted any attendance yet. Records will appear
              here once submitted.
            </p>
            <Link href="/teacher/validate">
              <Button>Go to Teacher Portal</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <DataTable data={submissions} />
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </>
      )}
    </PageLayout>
  );
}
