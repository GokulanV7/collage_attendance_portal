"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { RadioGroup, attendanceOptions } from "@/components/RadioGroup";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getStudentsByClass, getBatches, getDepartments } from "@/data/mockDatabase";
import { getPeriods } from "@/data/mockStaffAndPeriods";
import { useAttendance } from "@/context/AttendanceContext";
import { Student, AttendanceStatus, AttendanceSubmission } from "@/types";

export default function TeacherMarkAttendance() {
  const router = useRouter();
  const { addSubmission } = useAttendance();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());
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
    const periodsStr = sessionStorage.getItem("selectedPeriods");

    if (!staffId || !batch || !dept || !classId || !periodsStr) {
      router.push("/teacher/validate");
      return;
    }

    // Load students
    const fetchedStudents = getStudentsByClass(dept, classId);
    setStudents(fetchedStudents);

    // Initialize all as Present
    const initialMap = new Map<string, AttendanceStatus>();
    fetchedStudents.forEach((student) => {
      initialMap.set(student.id, "Present");
    });
    setAttendanceMap(initialMap);

    // Set context
    const periods = JSON.parse(periodsStr) as number[];
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

  const handleSubmit = () => {
    const staffId = sessionStorage.getItem("staffId") || "";
    const staffName = sessionStorage.getItem("staffName") || "";
    
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
      <ProgressIndicator currentStep={5} totalSteps={6} steps={steps} />

      {/* Summary Card */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">On-Duty</p>
            <p className="text-2xl font-bold text-blue-600">{onDutyCount}</p>
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
                <h3 className="text-sm font-medium text-slate-700">{student.name}</h3>
                <p className="font-mono text-xs text-slate-500">{student.rollNo}</p>
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
      <div className="sticky bottom-0 bg-gray-50 p-4">
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="flex-1"
          >
            Back
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit Attendance
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
