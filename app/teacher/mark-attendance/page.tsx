"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { RadioGroup, attendanceOptions } from "@/components/RadioGroup";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getStudentsByClass, getBatches, getDepartments } from "@/data/mockDatabase";
import { getPeriods } from "@/data/mockStaffAndPeriods";
import { useAttendance } from "@/context/AttendanceContext";
import { Student, AttendanceStatus, AttendanceSubmission } from "@/types";

export default function TeacherMarkAttendance() {
  const router = useRouter();
  const { addSubmission } = useAttendance();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [contextInfo, setContextInfo] = useState({
    batch: "",
    department: "",
    class: "",
    periods: [] as number[],
  });

  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    // Validate session
    const staffId = sessionStorage.getItem("staffId");
    const batch = sessionStorage.getItem("selectedBatch");
    const dept = sessionStorage.getItem("selectedDepartment");
    const classId = sessionStorage.getItem("selectedClass");
    const numberOfPeriods = sessionStorage.getItem("numberOfPeriods");
    const savedStaffName = sessionStorage.getItem("staffName");

    if (!staffId || !batch || !dept || !classId || !numberOfPeriods) {
      router.push("/teacher/validate");
      return;
    }

    // Set staff name
    setStaffName(savedStaffName || "");

    // Load students
    const fetchedStudents = getStudentsByClass(dept, classId);
    setStudents(fetchedStudents);

    // Initialize all as Present
    const initialMap = new Map<string, AttendanceStatus>();
    fetchedStudents.forEach((student) => {
      initialMap.set(student.id, "Present");
    });
    setAttendanceMap(initialMap);

    // Set context - convert numberOfPeriods to period array for backwards compatibility
    const periodCount = parseInt(numberOfPeriods);
    const periods = Array.from({ length: periodCount }, (_, i) => i + 1);
    setContextInfo({ batch, department: dept, class: classId, periods });
  }, [router]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(new Map(attendanceMap.set(studentId, status)));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap = new Map(attendanceMap);
    students.forEach((student) => {
      newMap.set(student.id, status);
    });
    setAttendanceMap(newMap);
  };

  const handleSubmitClick = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmPopup(false);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const staffId = sessionStorage.getItem("staffId") || "";
      
      // Get readable names
      const batchName = getBatches().find(b => b.id === contextInfo.batch)?.name || "";
      const deptName = getDepartments().find(d => d.id === contextInfo.department)?.name || "";
      const allPeriods = getPeriods();
      const className = contextInfo.class.split("-")[1] || contextInfo.class;

      // Build attendance records
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        status: attendanceMap.get(student.id) || "Present",
      }));

      // Create submission
      const now = new Date();
      const submission: AttendanceSubmission = {
        id: `ATT${Date.now()}`,
        batch: batchName,
        department: deptName,
        class: className,
        periods: contextInfo.periods,
        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        staffId,
        staffName,
        attendance: attendanceRecords,
      };

      // Save to context
      addSubmission(submission);

      // Store for confirmation page
      sessionStorage.setItem("lastSubmission", JSON.stringify(submission));

      // Navigate to confirmation
      router.push("/teacher/confirmation");
    }, 1500);
  };

  const handleCancelConfirm = () => {
    setShowConfirmPopup(false);
  };

  const presentCount = Array.from(attendanceMap.values()).filter(s => s === "Present").length;
  const absentCount = Array.from(attendanceMap.values()).filter(s => s === "Absent").length;
  const onDutyCount = Array.from(attendanceMap.values()).filter(s => s === "On-Duty").length;

  return (
    <PageLayout
      title="Mark Attendance"
      subtitle="Set attendance status for each student"
      showBackButton
      backHref="/teacher/class-period"
    >
      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-neutral-primary mb-4">Confirm Submission</h3>
            <p className="text-neutral-secondary mb-2">You are submitting attendance as:</p>
            <p className="text-lg font-semibold text-brand-secondary mb-6">{staffName}</p>
            <p className="text-sm text-neutral-muted mb-6">
              Present: {presentCount} | Absent: {absentCount} | On-Duty: {onDutyCount}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCancelConfirm} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit} className="flex-1">
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner message="Submitting attendance..." />}

      <ProgressIndicator currentStep={5} totalSteps={6} steps={steps} />

      {/* Summary Card */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">Total</p>
            <p className="text-2xl font-bold text-neutral-primary">{students.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">Present</p>
            <p className="text-2xl font-bold text-status-success">{presentCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">Absent</p>
            <p className="text-2xl font-bold text-status-danger">{absentCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">On-Duty</p>
            <p className="text-2xl font-bold text-status-info">{onDutyCount}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => handleMarkAll("Present")}
            variant="outline"
            className="flex-1"
          >
            Mark All Present
          </Button>
          <Button
            onClick={() => handleMarkAll("Absent")}
            variant="outline"
            className="flex-1"
          >
            Mark All Absent
          </Button>
        </div>
      </Card>

      {/* Student List */}
      <div className="space-y-3 mb-4">
        {students.map((student) => (
          <Card key={student.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-primary">{student.name}</h3>
                <p className="font-mono text-xs text-neutral-muted">{student.rollNo}</p>
              </div>
              <RadioGroup
                value={attendanceMap.get(student.id) || "Present"}
                onChange={(status) => handleStatusChange(student.id, status)}
                options={attendanceOptions}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-brand-background p-4 border-t border-neutral-border">
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="flex-1"
          >
            Back
          </Button>
          <Button onClick={handleSubmitClick} className="flex-1">
            Submit Attendance
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
