"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { AttendanceSubmission } from "@/types";
import { getPeriods } from "@/data/mockStaffAndPeriods";

export default function TeacherConfirmation() {
  const [submission, setSubmission] = useState<AttendanceSubmission | null>(null);
  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    const submissionStr = sessionStorage.getItem("lastSubmission");
    if (submissionStr) {
      setSubmission(JSON.parse(submissionStr));
    }
  }, []);

  if (!submission) return null;

  const presentCount = submission.attendance.filter(a => a.status === "Present").length;
  const absentCount = submission.attendance.filter(a => a.status === "Absent").length;
  const onDutyCount = submission.attendance.filter(a => a.status === "On-Duty").length;
  const absentStudents = submission.attendance.filter(a => a.status === "Absent");

  const allPeriods = getPeriods();
  const periodNames = submission.periods.map(pid => 
    allPeriods.find(p => p.id === pid)?.name || `Period ${pid}`
  ).join(", ");

  return (
    <PageLayout
      title="Attendance Submitted"
      subtitle="Your attendance has been recorded successfully"
    >
      <ProgressIndicator currentStep={6} totalSteps={6} steps={steps} />

      <Card className="mb-4">
        <div className="bg-status-successSoft border border-status-success p-4 mb-6 rounded-2xl">
          <p className="text-status-successStrong text-center font-medium">
            ✓ Attendance has been recorded successfully
          </p>
        </div>

        {/* Submission Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-neutral-primary">Submission Details</h3>
          <div className="bg-brand-background p-4 space-y-2 text-sm rounded-2xl">
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Batch:</span>
              <span className="font-medium">{submission.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Department:</span>
              <span className="font-medium">{submission.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Class:</span>
              <span className="font-medium">{submission.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Period(s):</span>
              <span className="font-medium">{periodNames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Date:</span>
              <span className="font-medium">{submission.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Time:</span>
              <span className="font-medium">{submission.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-secondary">Staff:</span>
              <span className="font-medium">{submission.staffName} ({submission.staffId})</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6">
          <h3 className="font-semibold text-neutral-primary mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-brand-background p-4 text-center rounded-2xl border border-neutral-border/60">
              <p className="text-sm text-neutral-secondary">Total</p>
              <p className="text-2xl font-bold text-neutral-primary">{submission.attendance.length}</p>
            </div>
            <div className="bg-status-successSoft p-4 text-center rounded-2xl border border-status-success/60">
              <p className="text-sm text-status-successStrong/80">Present</p>
              <p className="text-2xl font-bold text-status-successStrong">{presentCount}</p>
            </div>
            <div className="bg-status-dangerSoft p-4 text-center rounded-2xl border border-status-danger/60">
              <p className="text-sm text-status-dangerStrong/80">Absent</p>
              <p className="text-2xl font-bold text-status-dangerStrong">{absentCount}</p>
            </div>
            <div className="bg-status-infoSoft p-4 text-center rounded-2xl border border-status-info/60">
              <p className="text-sm text-status-infoStrong/80">On-Duty</p>
              <p className="text-2xl font-bold text-status-infoStrong">{onDutyCount}</p>
            </div>
          </div>
        </div>

        {/* Absent Students */}
        {absentStudents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-neutral-primary mb-3">Absent Students</h3>
            <div className="bg-status-dangerSoft border border-status-danger p-4 space-y-2 rounded-2xl">
              {absentStudents.map(student => (
                <div key={student.studentId} className="flex justify-between text-sm text-status-dangerStrong">
                  <span className="font-medium">{student.studentName}</span>
                  <span className="text-status-dangerStrong/80">{student.rollNo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Link href="/teacher/validate" className="flex-1">
            <Button fullWidth>Mark New Attendance</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="secondary" fullWidth>Back to Home</Button>
          </Link>
        </div>
      </Card>
    </PageLayout>
  );
}
