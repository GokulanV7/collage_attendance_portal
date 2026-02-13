"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";
import { StudentRow } from "@/components/StudentRow";
import { Student } from "@/types";
import {
  getBatches,
  getDepartments,
  getClassesByDepartment,
  getStudentsByClass,
} from "@/data/mockDatabase";

type Step = "selection" | "attendance" | "confirmation";

interface LegacyAttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  isPresent: boolean;
}

interface LegacyAttendanceSubmission {
  batch: string;
  department: string;
  class: string;
  date: string;
  time: string;
  staffId: string;
  staffName: string;
  attendance: LegacyAttendanceRecord[];
}

export default function Home() {
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("selection");

  // Selection state
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Attendance state
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Map<string, boolean>
  >(new Map());

  // Staff details
  const [staffId, setStaffId] = useState("");
  const [staffName, setStaffName] = useState("");

  // Submission state
  const [submittedData, setSubmittedData] = useState<LegacyAttendanceSubmission | null>(
    null
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data from mock database
  const batches = getBatches();
  const departments = getDepartments();
  const [availableClasses, setAvailableClasses] = useState<
    { id: string; name: string }[]
  >([]);

  // Update available classes when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const classes = getClassesByDepartment(selectedDepartment);
      setAvailableClasses(classes);
      setSelectedClass(""); // Reset class selection
    } else {
      setAvailableClasses([]);
    }
  }, [selectedDepartment]);

  // Validation function
  const validateSelection = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedBatch) {
      newErrors.batch = "Please select a batch";
    }
    if (!selectedDepartment) {
      newErrors.department = "Please select a department";
    }
    if (!selectedClass) {
      newErrors.class = "Please select a class";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStaffDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!staffId.trim()) {
      newErrors.staffId = "Staff ID is required";
    }
    if (!staffName.trim()) {
      newErrors.staffName = "Staff Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceeding to attendance marking
  const handleProceedToAttendance = () => {
    if (!validateSelection()) {
      return;
    }

    // Fetch students for selected class
    const fetchedStudents = getStudentsByClass(
      selectedDepartment,
      selectedClass
    );
    setStudents(fetchedStudents);

    // Initialize all students as present by default
    const initialAttendance = new Map<string, boolean>();
    fetchedStudents.forEach((student) => {
      initialAttendance.set(student.id, true);
    });
    setAttendanceMap(initialAttendance);

    setCurrentStep("attendance");
    setErrors({});
  };

  // Handle attendance toggle
  const handleAttendanceToggle = (studentId: string, isPresent: boolean) => {
    setAttendanceMap(new Map(attendanceMap.set(studentId, isPresent)));
  };

  // Handle mark all
  const handleMarkAll = (status: boolean) => {
    const newMap = new Map(attendanceMap);
    students.forEach((student) => {
      newMap.set(student.id, status);
    });
    setAttendanceMap(newMap);
  };

  // Handle submission
  const handleSubmit = () => {
    if (!validateStaffDetails()) {
      return;
    }

    // Prepare attendance records
    const attendanceRecords: LegacyAttendanceRecord[] = students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      isPresent: attendanceMap.get(student.id) || false,
    }));

    // Get batch and department names
    const batchName = batches.find((b) => b.id === selectedBatch)?.name || "";
    const departmentName =
      departments.find((d) => d.id === selectedDepartment)?.name || "";
    const className = availableClasses.find((c) => c.id === selectedClass)?.name || "";

    // Create submission object
    const now = new Date();
    const submission: LegacyAttendanceSubmission = {
      batch: batchName,
      department: departmentName,
      class: className,
      date: now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      staffId: staffId.trim(),
      staffName: staffName.trim(),
      attendance: attendanceRecords,
    };

    setSubmittedData(submission);
    setCurrentStep("confirmation");
    setErrors({});

    // In a real app, you would send this to a backend API here
    console.log("Attendance Submitted:", submission);
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep("selection");
    setSelectedBatch("");
    setSelectedDepartment("");
    setSelectedClass("");
    setStudents([]);
    setAttendanceMap(new Map());
    setStaffId("");
    setStaffName("");
    setSubmittedData(null);
    setErrors({});
  };

  // Render selection step
  const renderSelectionStep = () => (
    <Card
      className="bg-brand-primaryLight border-brand-secondary/30 text-brand-secondary shadow-[0_35px_120px_rgba(46,125,50,0.18)]"
    >
      <div className="mb-4 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-secondary/80">
          Quick Setup
        </p>
        <h2 className="text-2xl font-bold text-brand-secondary mt-2">
          Mark Attendance
        </h2>
        <p className="text-sm text-brand-secondary/80">
          Choose batch, department, and class to get started
        </p>
      </div>

      <div className="space-y-4">
        <Select
          label="Batch"
          value={selectedBatch}
          onChange={setSelectedBatch}
          options={batches}
          placeholder="Select batch"
          required
          error={errors.batch}
        />

        <Select
          label="Department"
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          options={departments}
          placeholder="Select department"
          required
          error={errors.department}
        />

        {selectedDepartment && (
          <Select
            label="Class"
            value={selectedClass}
            onChange={setSelectedClass}
            options={availableClasses}
            placeholder="Select class"
            required
            error={errors.class}
          />
        )}

        <Button
          onClick={handleProceedToAttendance}
          fullWidth
          className="mt-6"
        >
          Proceed to Mark Attendance
        </Button>
      </div>
    </Card>
  );

  // Render attendance step
  const renderAttendanceStep = () => {
    const presentCount = Array.from(attendanceMap.values()).filter(
      (v) => v === true
    ).length;
    const absentCount = students.length - presentCount;

    return (
      <div className="space-y-4">
        <Card className="bg-brand-primaryLight border-brand-secondary/30 text-brand-secondary shadow-[0_35px_120px_rgba(46,125,50,0.18)]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-brand-secondary">
              Mark Attendance
            </h2>
            <p className="text-sm text-brand-secondary/80 mt-1">
              {batches.find((b) => b.id === selectedBatch)?.name} •{" "}
              {departments.find((d) => d.id === selectedDepartment)?.name} •
              Class {availableClasses.find((c) => c.id === selectedClass)?.name}
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => handleMarkAll(true)}
              variant="outline"
              className="flex-1"
            >
              Mark All Present
            </Button>
            <Button
              onClick={() => handleMarkAll(false)}
              variant="outline"
              className="flex-1"
            >
              Mark All Absent
            </Button>
          </div>

          <div className="bg-brand-background border border-brand-secondary/30 p-4 rounded-2xl mb-4 flex justify-around">
            <div className="text-center">
              <p className="text-sm text-brand-secondary/80">Total Students</p>
              <p className="text-2xl font-bold text-brand-secondary">
                {students.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-brand-secondary/80">Present</p>
              <p className="text-2xl font-bold text-status-success">
                {presentCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-brand-secondary/80">Absent</p>
              <p className="text-2xl font-bold text-status-danger">{absentCount}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              isPresent={attendanceMap.get(student.id) || false}
              onToggle={handleAttendanceToggle}
            />
          ))}
        </div>

        <Card className="bg-brand-primaryLight border-brand-secondary/30 text-brand-secondary shadow-[0_35px_120px_rgba(46,125,50,0.18)]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-brand-secondary">Staff Details</h2>
            <p className="text-sm text-brand-secondary/80">
              Identify yourself for submission records
            </p>
          </div>
          <div className="space-y-4">
            <Input
              label="Staff ID"
              value={staffId}
              onChange={setStaffId}
              placeholder="Enter your staff ID"
              required
              error={errors.staffId}
            />
            <Input
              label="Staff Name"
              value={staffName}
              onChange={setStaffName}
              placeholder="Enter your full name"
              required
              error={errors.staffName}
            />
          </div>
        </Card>

        <div className="sticky bottom-0 bg-brand-primarySoft border border-brand-secondary/30 p-4 rounded-2xl flex gap-3 shadow-lg">
          <Button onClick={handleReset} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit Attendance
          </Button>
        </div>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmationStep = () => {
    if (!submittedData) return null;

    const presentStudents = submittedData.attendance.filter((a) => a.isPresent);
    const absentStudents = submittedData.attendance.filter((a) => !a.isPresent);

    return (
      <Card className="bg-brand-primaryLight border-brand-secondary/30 text-brand-secondary shadow-[0_35px_120px_rgba(46,125,50,0.18)]">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-brand-secondary/80">
            Success
          </p>
          <h2 className="text-2xl font-bold text-brand-secondary mt-2">
            Attendance Submitted Successfully
          </h2>
        </div>
        <div className="space-y-6">
          <div className="bg-status-successSoft border border-status-success rounded-2xl p-4">
            <p className="text-status-successStrong text-center font-medium">
              ✓ Attendance has been recorded successfully
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-secondary">Submission Details</h3>
            <div className="bg-brand-background p-4 rounded-2xl space-y-2 text-sm border border-brand-secondary/20">
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Batch:</span>
                <span className="font-medium">{submittedData.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Department:</span>
                <span className="font-medium">{submittedData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Class:</span>
                <span className="font-medium">{submittedData.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Date:</span>
                <span className="font-medium">{submittedData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Time:</span>
                <span className="font-medium">{submittedData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Staff ID:</span>
                <span className="font-medium">{submittedData.staffId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary/80">Staff Name:</span>
                <span className="font-medium">{submittedData.staffName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-secondary">Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-brand-background p-4 rounded-2xl text-center border border-brand-secondary/20">
                <p className="text-sm text-brand-secondary/80">Total</p>
                <p className="text-2xl font-bold text-brand-secondary">
                  {submittedData.attendance.length}
                </p>
              </div>
              <div className="bg-status-successSoft p-4 rounded-2xl text-center border border-status-success/60">
                <p className="text-sm text-status-successStrong/80">Present</p>
                <p className="text-2xl font-bold text-status-successStrong">
                  {presentStudents.length}
                </p>
              </div>
              <div className="bg-status-dangerSoft p-4 rounded-2xl text-center border border-status-danger/60">
                <p className="text-sm text-status-dangerStrong/80">Absent</p>
                <p className="text-2xl font-bold text-status-dangerStrong">
                  {absentStudents.length}
                </p>
              </div>
            </div>
          </div>

          {absentStudents.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-brand-secondary">Absent Students</h3>
              <div className="bg-status-dangerSoft border border-status-danger rounded-2xl p-4 space-y-2">
                {absentStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex justify-between text-sm text-status-dangerStrong"
                  >
                    <span className="font-medium">{student.studentName}</span>
                    <span className="text-status-dangerStrong/80">{student.rollNo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleReset} fullWidth>
            Mark New Attendance
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <main className="min-h-screen bg-brand-primary flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center mb-4 bg-brand-primaryLight border border-brand-secondary/30 rounded-3xl p-8 shadow-[0_35px_120px_rgba(46,125,50,0.18)]">
          <h1 className="text-3xl font-bold text-brand-secondary mb-2">
            Attendance Portal
          </h1>
          <p className="text-brand-secondary/80">
            College Attendance Management System
          </p>
        </div>

        {currentStep === "selection" && renderSelectionStep()}
        {currentStep === "attendance" && renderAttendanceStep()}
        {currentStep === "confirmation" && renderConfirmationStep()}
      </div>
    </main>
  );
}
