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
        {/* Staff Portal */}
        <Link href="/staff/validate">
          <Card className="cursor-pointer border-2 border-brand-primary/40 hover:border-brand-secondary transition h-full">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-primary mb-2">
                Staff Portal
              </h2>
              <p className="text-neutral-secondary mb-4">
                Mark attendance for your classes
              </p>
              <span className="text-brand-secondary font-semibold">
                Continue as Staff →
              </span>
            </div>
          </Card>
        </Link>

        {/* Admin Portal */}
        <Link href="/admin/login">
          <Card className="cursor-pointer border-2 border-brand-primary/40 hover:border-brand-secondary transition h-full">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-primary mb-2">
                Admin Portal
              </h2>
              <p className="text-neutral-secondary mb-4">
                View and manage attendance records
              </p>
              <span className="text-brand-secondary font-semibold">
                Continue as Admin →
              </span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="mt-8 bg-brand-primarySoft border-2 border-brand-secondary/30">
        <div className="text-center">
          <h3 className="font-semibold text-brand-secondary mb-2">Quick Info</h3>
          <p className="text-sm text-brand-secondary/90">
            <strong>Staff:</strong> Validate with Staff ID → Select
            Batch/Department → Mark Attendance
          </p>
          <p className="text-sm text-brand-secondary/90 mt-1">
            <strong>Admins:</strong> View all attendance records in Excel-style
            tables with filters
          </p>
        </div>
      </Card>
    </PageLayout>
  );
}
