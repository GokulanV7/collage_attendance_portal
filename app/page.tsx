"use client";

import React from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

export default function Home() {
  return (
    <PageLayout
      title="Attendance Management Portal"
      subtitle="Select your role to continue"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Teacher Portal */}
        <Link href="/teacher/validate">
          <Card className="cursor-pointer border-2 border-gray-200 hover:border-primary-500 h-full">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Teacher Portal
              </h2>
              <p className="text-slate-600 mb-4">
                Mark attendance for your classes
              </p>
              <span className="text-primary-600 font-medium">
                Continue as Teacher →
              </span>
            </div>
          </Card>
        </Link>

        {/* Admin Portal */}
        <Link href="/admin/login">
          <Card className="cursor-pointer border-2 border-gray-200 hover:border-primary-500 h-full">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Admin Portal
              </h2>
              <p className="text-slate-600 mb-4">
                View and manage attendance records
              </p>
              <span className="text-primary-600 font-medium">
                Continue as Admin →
              </span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="mt-8 bg-primary-50 border border-primary-200">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Info</h3>
          <p className="text-sm text-gray-700">
            <strong>Teachers:</strong> Validate with Staff ID → Select
            Batch/Department → Mark Attendance
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Admins:</strong> View all attendance records in Excel-style
            tables with filters
          </p>
        </div>
      </Card>
    </PageLayout>
  );
}
