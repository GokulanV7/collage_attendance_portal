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
        <div className="bg-green-50 border border-green-200 p-4 mb-6">
          <p className="text-green-800 text-center font-medium">
            ✓ Attendance has been recorded successfully
          </p>
        </div>

        {/* Submission Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Submission Details</h3>
          <div className="bg-gray-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Batch:</span>
              <span className="font-medium">{submission.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{submission.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{submission.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Period(s):</span>
              <span className="font-medium">{periodNames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{submission.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{submission.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Staff:</span>
              <span className="font-medium">{submission.staffName} ({submission.staffId})</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-100 p-4 text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{submission.attendance.length}</p>
            </div>
            <div className="bg-green-100 p-4 text-center">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            </div>
            <div className="bg-red-100 p-4 text-center">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
            </div>
            <div className="bg-blue-100 p-4 text-center">
              <p className="text-sm text-gray-600">On-Duty</p>
              <p className="text-2xl font-bold text-blue-700">{onDutyCount}</p>
            </div>
          </div>
        </div>

        {/* Absent Students */}
        {absentStudents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Absent Students</h3>
            <div className="bg-red-50 border border-red-200 p-4 space-y-2">
              {absentStudents.map(student => (
                <div key={student.studentId} className="flex justify-between text-sm">
                  <span className="font-medium">{student.studentName}</span>
                  <span className="text-gray-600">{student.rollNo}</span>
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
