"use client";

import React from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

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
  const [submittedData, setSubmittedData] = useState<AttendanceSubmission | null>(
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
    const attendanceRecords: AttendanceRecord[] = students.map((student) => ({
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
    const submission: AttendanceSubmission = {
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
    <Card title="Mark Attendance">
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
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Mark Attendance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
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

          <div className="bg-gray-100 p-3 rounded-lg mb-4 flex justify-around">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {presentCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
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

        <Card title="Staff Details">
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

        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-lg flex gap-3">
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
      <Card title="Attendance Submitted Successfully">
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center font-medium">
              ✓ Attendance has been recorded successfully
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Submission Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Batch:</span>
                <span className="font-medium">{submittedData.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{submittedData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">{submittedData.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{submittedData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{submittedData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Staff ID:</span>
                <span className="font-medium">{submittedData.staffId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Staff Name:</span>
                <span className="font-medium">{submittedData.staffName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submittedData.attendance.length}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-700">
                  {presentStudents.length}
                </p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">
                  {absentStudents.length}
                </p>
              </div>
            </div>
          </div>

          {absentStudents.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Absent Students</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                {absentStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-medium">{student.studentName}</span>
                    <span className="text-gray-600">{student.rollNo}</span>
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
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attendance Portal
          </h1>
          <p className="text-gray-600">College Attendance Management System</p>
        </div>

        {currentStep === "selection" && renderSelectionStep()}
        {currentStep === "attendance" && renderAttendanceStep()}
        {currentStep === "confirmation" && renderConfirmationStep()}
      </div>
    </main>
  );
}
