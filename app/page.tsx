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
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500 h-full">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Teacher Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Mark attendance for your classes
              </p>
              <div className="inline-flex items-center gap-2 text-primary-600 font-medium">
                Continue as Teacher
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </Link>

        {/* Admin Portal */}
        <Link href="/admin/login">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500 h-full">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Portal
              </h2>
              <p className="text-gray-600 mb-4">
                View and manage attendance records
              </p>
              <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                Continue as Admin
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
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
