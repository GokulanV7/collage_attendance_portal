"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getStudentsByClass, getBatches, getDepartments } from "@/data/mockDatabase";
import { getPeriodConfig, PERIOD_CONFIG_45MIN } from "@/data/periodConfigs";
import {
  getTodayDate,
  getCurrentTimeFormatted,
  formatTo12Hour,
  checkTimeValidity,
  checkDuplicateAttendance,
  saveAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  clearTodayAttendance,
} from "@/utils/attendanceStorage";
import { Student, Period } from "@/types";

interface MessageState {
  type: "success" | "error" | "warning" | "info";
  text: string;
  visible: boolean;
}

export default function QuickMarkAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [message, setMessage] = useState<MessageState>({
    type: "info",
    text: "",
    visible: false,
  });
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTimeFormatted());

  // Initialize UI with default period config
  useEffect(() => {
    const config = getPeriodConfig(45); // Default to 45-min periods
    setPeriods(config.periods);

    // Get some sample students to show
    const allBatches = getBatches();
    if (allBatches.length > 0) {
      const firstBatch = allBatches[0];
      setBatch(firstBatch.id);

      const depts = getDepartments(firstBatch.id);
      if (depts.length > 0) {
        const firstDept = depts[0];
        setDepartment(firstDept.id);

        const studentsData = getStudentsByClass(firstBatch.id, firstDept.id, "A");
        setStudents(studentsData);
      }
    }
  }, []);

  // Load today's attendance
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = () => {
    const todayRecords = getTodayAttendance();
    setTodayAttendance(todayRecords);
  };

  const showMessage = (type: MessageState["type"], text: string) => {
    setMessage({ type, text, visible: true });
    setTimeout(() => {
      setMessage((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleChangeClass = (classId: string) => {
    if (batch && department) {
      const studentsData = getStudentsByClass(batch, department, classId);
      setStudents(studentsData);
      setSelectedStudent("");
      subject === "" && setSubject(classId);
    }
  };

  const handleMarkAttendance = async () => {
    // Validation
    if (!selectedStudent) {
      showMessage("error", "Please select a student");
      return;
    }

    if (!selectedPeriod) {
      showMessage("error", "Please select a period");
      return;
    }

    if (!subject) {
      showMessage("error", "Please select a subject");
      return;
    }

    const period = periods.find((p) => p.id === parseInt(selectedPeriod));
    if (!period) {
      showMessage("error", "Invalid period selected");
      return;
    }

    // Check time validity
    const isValidTime = checkTimeValidity(period.startTime, period.endTime, currentTime);
    if (!isValidTime) {
      const formattedStart = formatTo12Hour(period.startTime);
      const formattedEnd = formatTo12Hour(period.endTime);
      showMessage(
        "error",
        `Attendance is only allowed during class hours (${formattedStart} - ${formattedEnd})`
      );
      return;
    }

    // Check for duplicates
    const duplicate = checkDuplicateAttendance(selectedStudent, subject);
    if (duplicate) {
      showMessage("warning", "Attendance already marked for today in this subject");
      return;
    }

    // Mark attendance
    setIsLoading(true);
    try {
      const student = students.find((s) => s.id === selectedStudent);
      if (!student) {
        showMessage("error", "Student not found");
        return;
      }

      saveAttendance({
        studentId: selectedStudent,
        studentName: student.name,
        subjectId: subject,
        period: period.name,
      });

      showMessage(
        "success",
        `✓ Attendance marked for ${student.name} in ${period.name}`
      );

      // Reset form
      setSelectedStudent("");
      setSelectedPeriod("");

      // Reload today's attendance
      setTimeout(() => {
        loadTodayAttendance();
      }, 500);
    } catch (error) {
      showMessage("error", "Failed to mark attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTodayData = () => {
    if (confirm("Are you sure you want to clear all today's attendance records? This cannot be undone.")) {
      clearTodayAttendance();
      loadTodayAttendance();
      showMessage("info", "Today's attendance data cleared");
    }
  };

  const summaryData = getAttendanceSummary();
  const messageColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <PageLayout
      title="Mark Attendance (Quick)"
      subtitle="Date & Time Based Attendance Marking"
    >
      {/* Message Display */}
      {message.visible && (
        <div className={`mb-4 p-3 border rounded-lg ${messageColors[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner message="Marking attendance..." />}

      {/* Current Time & Date Display */}
      <Card className="mb-4 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-secondary">Today's Date</p>
            <p className="text-lg font-bold text-neutral-primary">{getTodayDate()}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-secondary">Current Time</p>
            <p className="text-lg font-bold text-brand-primary">{formatTo12Hour(currentTime)}</p>
          </div>
        </div>
      </Card>

      {/* Selection Form */}
      <Card className="mb-4 border border-neutral-border">
        <h3 className="text-lg font-bold text-neutral-primary mb-4">Mark Student Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Batch Selection */}
          <div>
            <Select
              label="Batch"
              value={batch}
              onChange={setBatch}
              options={getBatches().map((b) => ({
                id: b.id,
                name: b.name,
              }))}
              placeholder="Select Batch"
            />
          </div>

          {/* Department Selection */}
          <div>
            <Select
              label="Department"
              value={department}
              onChange={setDepartment}
              options={getDepartments(batch).map((d) => ({
                id: d.id,
                name: d.name,
              }))}
              placeholder="Select Department"
            />
          </div>

          {/* Class/Subject Selection */}
          <div>
            <Select
              label="Class / Subject"
              value={subject}
              onChange={(val) => {
                setSubject(val);
                handleChangeClass(val);
              }}
              options={[
                { id: "A", name: "Class A" },
                { id: "B", name: "Class B" },
              ]}
              placeholder="Select Class"
            />
          </div>

          {/* Period Selection */}
          <div>
            <Select
              label="Period"
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={periods.map((p) => ({
                id: p.id.toString(),
                name: `${p.name} (${p.startTime}-${p.endTime})`,
              }))}
              placeholder="Select Period"
            />
          </div>

          {/* Student Selection */}
          <div className="md:col-span-2">
            <Select
              label="Student"
              value={selectedStudent}
              onChange={setSelectedStudent}
              options={students.map((s) => ({
                id: s.id,
                name: `${s.name} (${s.rollNo})`,
              }))}
              placeholder="Select Student"
            />
          </div>
        </div>

        {/* Mark Button */}
        <Button onClick={handleMarkAttendance} className="w-full" disabled={isLoading}>
          Mark Attendance
        </Button>
      </Card>

      {/* Summary Stats */}
      <Card className="mb-4">
        <h3 className="text-lg font-bold text-neutral-primary mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-neutral-background rounded">
            <p className="text-sm text-neutral-secondary">Total Marked</p>
            <p className="text-2xl font-bold text-brand-primary">{summaryData.total}</p>
          </div>
          <div className="text-center p-3 bg-neutral-background rounded">
            <p className="text-sm text-neutral-secondary">Unique Students</p>
            <p className="text-2xl font-bold text-status-success">
              {Object.keys(summaryData.byStudent).length}
            </p>
          </div>
          <div className="text-center p-3 bg-neutral-background rounded">
            <p className="text-sm text-neutral-secondary">Subjects</p>
            <p className="text-2xl font-bold text-status-info">
              {Object.keys(summaryData.bySubject).length}
            </p>
          </div>
        </div>
      </Card>

      {/* Today's Attendance List */}
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-neutral-primary">Today's Attendance List</h3>
          {todayAttendance.length > 0 && (
            <Button
              onClick={handleClearTodayData}
              variant="outline"
              className="text-sm py-1 px-3"
            >
              Clear Data
            </Button>
          )}
        </div>

        {todayAttendance.length === 0 ? (
          <p className="text-center py-6 text-neutral-secondary italic">
            No attendance records found for today
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="text-left py-2 px-2 font-semibold text-neutral-primary">
                    Student
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-primary">
                    Subject
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-primary">
                    Period
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-primary">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map((record, index) => (
                  <tr key={index} className="border-b border-neutral-border hover:bg-neutral-background">
                    <td className="py-3 px-2">
                      <div className="font-medium text-neutral-primary">{record.studentName}</div>
                      <div className="text-xs text-neutral-secondary font-mono">
                        {record.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-neutral-primary font-mono text-xs bg-blue-50 rounded px-2 inline-block">
                      {record.subjectId}
                    </td>
                    <td className="py-3 px-2 text-neutral-secondary text-sm">
                      {record.period}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-neutral-secondary font-mono">
                        {formatTo12Hour(record.time)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Footer Info */}
      <Card className="bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-neutral-primary mb-2">ℹ️ Demo Information</h4>
        <ul className="text-sm text-neutral-secondary space-y-1 list-disc list-inside">
          <li>Attendance can only be marked during valid class hours</li>
          <li>Each student can only be marked once per subject per day</li>
          <li>Data is stored in browser's localStorage (demo only)</li>
          <li>Use "Clear Data" button to reset for next demo session</li>
        </ul>
      </Card>
    </PageLayout>
  );
}
