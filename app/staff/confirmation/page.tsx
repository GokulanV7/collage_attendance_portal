"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { AttendanceSubmission } from "@/types";
import { formatTimeForDisplay } from "@/data/periodConfigs";

export default function StaffConfirmation() {
  const [submission, setSubmission] = useState<AttendanceSubmission | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"Present" | "Absent" | "On-Duty">("Absent");
  const steps = ["Staff ID", "Batch & Dept", "Class & Period", "Mark", "Confirm"];

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
  const filteredStudents = submission.attendance.filter(a => a.status === selectedFilter);

  // Format period display
  const periodNames = submission.periods.map(p => p.name).join(", ");
  const periodTimes = submission.periods.length === 1
    ? `${formatTimeForDisplay(submission.periods[0].startTime)} - ${formatTimeForDisplay(submission.periods[0].endTime)}`
    : `${formatTimeForDisplay(submission.periods[0].startTime)} - ${formatTimeForDisplay(submission.periods[submission.periods.length - 1].endTime)}`;

  return (
    <PageLayout
      title="Attendance Submitted"
      subtitle="Your attendance has been recorded successfully"
    >
      <ProgressIndicator currentStep={5} totalSteps={5} steps={steps} />

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
            {submission.semester && (
              <div className="flex justify-between">
                <span className="text-neutral-secondary">Semester:</span>
                <span className="font-medium">{submission.semester}</span>
              </div>
            )}
            {submission.subject && (
              <div className="flex justify-between">
                <span className="text-neutral-secondary">Subject:</span>
                <span className="font-medium">{submission.subject} ({submission.subjectCode})</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-neutral-secondary">Period(s):</span>
              <span className="font-medium">{periodNames}</span>
              <span className="text-xs text-neutral-secondary">{periodTimes}</span>
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
            <div
              onClick={() => setSelectedFilter("Present")}
              className={`bg-status-successSoft p-4 text-center rounded-2xl border cursor-pointer transition-all ${selectedFilter === "Present" ? "border-status-success ring-2 ring-status-success shadow-md scale-105" : "border-status-success/60 hover:border-status-success"}`}
            >
              <p className="text-sm text-status-successStrong/80">Present</p>
              <p className="text-2xl font-bold text-status-successStrong">{presentCount}</p>
            </div>
            <div
              onClick={() => setSelectedFilter("Absent")}
              className={`bg-status-dangerSoft p-4 text-center rounded-2xl border cursor-pointer transition-all ${selectedFilter === "Absent" ? "border-status-danger ring-2 ring-status-danger shadow-md scale-105" : "border-status-danger/60 hover:border-status-danger"}`}
            >
              <p className="text-sm text-status-dangerStrong/80">Absent</p>
              <p className="text-2xl font-bold text-status-dangerStrong">{absentCount}</p>
            </div>
            <div
              onClick={() => setSelectedFilter("On-Duty")}
              className={`bg-status-infoSoft p-4 text-center rounded-2xl border cursor-pointer transition-all ${selectedFilter === "On-Duty" ? "border-status-info ring-2 ring-status-info shadow-md scale-105" : "border-status-info/60 hover:border-status-info"}`}
            >
              <p className="text-sm text-status-infoStrong/80">On-Duty</p>
              <p className="text-2xl font-bold text-status-infoStrong">{onDutyCount}</p>
            </div>
          </div>
        </div>

        {/* Filtered Students List */}
        {filteredStudents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-neutral-primary mb-3">{selectedFilter} Students</h3>
            <div className={`p-4 space-y-2 rounded-2xl border ${
              selectedFilter === "Present" ? "bg-status-successSoft border-status-success" :
              selectedFilter === "Absent" ? "bg-status-dangerSoft border-status-danger" :
              "bg-status-infoSoft border-status-info"
            }`}>
              {filteredStudents.map(student => (
                <div key={student.studentId} className={`flex justify-between text-sm ${
                  selectedFilter === "Present" ? "text-status-successStrong" :
                  selectedFilter === "Absent" ? "text-status-dangerStrong" :
                  "text-status-infoStrong"
                }`}>
                  <span className="font-medium">{student.studentName}</span>
                  <span className="opacity-80">{student.rollNo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {filteredStudents.length === 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-neutral-primary mb-3">{selectedFilter} Students</h3>
            <div className="bg-brand-background border border-neutral-border p-4 rounded-2xl">
              <p className="text-sm text-neutral-secondary text-center">No {selectedFilter.toLowerCase()} students</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8">
          <Link href="/">
            <Button fullWidth>Mark New Attendance</Button>
          </Link>
        </div>
      </Card>
    </PageLayout>
  );
}
