"use client";

/**
 * EXAMPLE COMPONENT - Attendance System Usage Patterns
 * 
 * This file demonstrates different ways to use the attendance system
 * Pick the pattern that fits your use case
 *
 * DO NOT use this in production - it's for reference only
 * Copy relevant code to your actual components
 */

import React, { useState } from "react";
import {
  getTodayDate,
  getCurrentTimeFormatted,
  formatTo12Hour,
  checkTimeValidity,
  checkDuplicateAttendance,
  saveAttendance,
  getTodayAttendance,
  clearTodayAttendance,
} from "@/utils/attendanceStorage";
import { useAttendance } from "@/hooks/useAttendance";

// ============================================================================
// PATTERN 1: Using attendanceStorage directly (vanilla functions)
// Best for: Simple scripts, utilities, non-React code
// ============================================================================

export function Pattern1_DirectFunctions() {
  const [message, setMessage] = useState("");

  const handleQuickMark = () => {
    const studentId = "S101";
    const subjectId = "MATH";
    const currentTime = getCurrentTimeFormatted();

    // Check time (Period 1: 09:00 - 09:45)
    if (!checkTimeValidity("09:00", "09:45", currentTime)) {
      setMessage("❌ Outside class hours (09:00-09:45)");
      return;
    }

    // Check duplicate
    if (checkDuplicateAttendance(studentId, subjectId)) {
      setMessage("⚠️ Already marked for today");
      return;
    }

    // Mark attendance
    try {
      saveAttendance({
        studentId,
        studentName: "John Doe",
        subjectId,
        period: "Period 1",
      });
      setMessage("✅ Attendance marked successfully");
    } catch (error) {
      setMessage("❌ Error saving attendance");
    }
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-3">Pattern 1: Direct Functions</h3>
      <p className="text-sm mb-3">{message}</p>
      <button
        onClick={handleQuickMark}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Mark Attendance
      </button>
      <pre className="bg-gray-100 p-3 mt-3 text-xs rounded">
{`// Usage:
import { 
  checkTimeValidity, 
  saveAttendance 
} from "@/utils/attendanceStorage";

if (checkTimeValidity("09:00", "09:45")) {
  saveAttendance({
    studentId: "S101",
    studentName: "John Doe",
    subjectId: "MATH",
    period: "Period 1"
  });
}`}
      </pre>
    </div>
  );
}

// ============================================================================
// PATTERN 2: Using React Hook (useAttendance)
// Best for: React components with state management
// ============================================================================

export function Pattern2_ReactHook() {
  const { markAttendance, checkTimeValid, todayAttendance } = useAttendance();
  const [message, setMessage] = useState("");

  const handleMark = () => {
    // Validate time for Period 1 (09:00 - 09:45)
    if (!checkTimeValid("09:00", "09:45")) {
      setMessage("❌ Outside class hours");
      return;
    }

    // Mark attendance
    const result = markAttendance("S102", "Jane Smith", "ENG", "Period 1");
    setMessage(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-3">Pattern 2: React Hook</h3>
      <p className="text-sm mb-3">{message}</p>
      <p className="text-sm mb-3">Today's records: {todayAttendance.length}</p>
      <button
        onClick={handleMark}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Mark Attendance
      </button>
      <pre className="bg-gray-100 p-3 mt-3 text-xs rounded">
{`// Usage:
import { useAttendance } from "@/hooks/useAttendance";

const { 
  markAttendance, 
  checkTimeValid,
  todayAttendance 
} = useAttendance();

const result = markAttendance(
  "S102", 
  "Jane Smith", 
  "MATH", 
  "Period 1"
);`}
      </pre>
    </div>
  );
}

// ============================================================================
// PATTERN 3: Full Form with Validation
// Best for: Complete attendance marking UI
// ============================================================================

export function Pattern3_FullForm() {
  const { markAttendance, checkTimeValid, checkDuplicate } = useAttendance();
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [period, setPeriod] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!studentId || !studentName || !subjectId || !period) {
      setMessage("❌ All fields required");
      return;
    }

    // Get period times based on selection
    const periodTimes: Record<string, [string, string]> = {
      "Period 1": ["09:00", "09:45"],
      "Period 2": ["09:45", "10:30"],
      "Period 3": ["10:30", "11:15"],
    };

    const [startTime, endTime] = periodTimes[period] || ["09:00", "09:45"];

    // Check time
    if (!checkTimeValid(startTime, endTime)) {
      setMessage(`❌ Not during ${period} hours (${startTime}-${endTime})`);
      return;
    }

    // Check duplicate
    if (checkDuplicate(studentId, subjectId)) {
      setMessage("⚠️ Already marked for today");
      return;
    }

    // Mark
    const result = markAttendance(studentId, studentName, subjectId, period);
    setMessage(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);

    // Reset
    if (result.success) {
      setStudentId("");
      setStudentName("");
      setSubjectId("");
      setPeriod("");
    }
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-3">Pattern 3: Full Form</h3>
      {message && <p className="text-sm mb-3 p-2 bg-gray-100 rounded">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="S101"
            className="w-full border px-3 py-2 rounded text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="John Doe"
            className="w-full border px-3 py-2 rounded text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Subject</label>
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="MATH"
            className="w-full border px-3 py-2 rounded text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm mt-1"
          >
            <option value="">Select Period</option>
            <option value="Period 1">Period 1 (09:00-09:45)</option>
            <option value="Period 2">Period 2 (09:45-10:30)</option>
            <option value="Period 3">Period 3 (10:30-11:15)</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Mark Attendance
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// PATTERN 4: Data Display and Export
// Best for: Viewing and exporting attendance records
// ============================================================================

export function Pattern4_DataDisplay() {
  const { getTodayRecords, getSummary, clearToday } = useAttendance();
  const [showRecords, setShowRecords] = useState(false);

  const records = getTodayRecords();
  const summary = getSummary();

  const handleExport = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-3">Pattern 4: Data Display</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-xl font-bold">{summary.total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-xs text-gray-600">Subjects</p>
          <p className="text-xl font-bold">
            {Object.keys(summary.bySubject).length}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="text-xs text-gray-600">Students</p>
          <p className="text-xl font-bold">
            {Object.keys(summary.byStudent).length}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowRecords(!showRecords)}
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 mr-2"
      >
        {showRecords ? "Hide" : "Show"} Records
      </button>

      <button
        onClick={handleExport}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mr-2"
      >
        Export JSON
      </button>

      <button
        onClick={() => {
          if (confirm("Clear today's records?")) clearToday();
        }}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Data
      </button>

      {showRecords && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Student</th>
                <th className="border p-2 text-left">Subject</th>
                <th className="border p-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border">
                  <td className="border p-2">{r.studentName}</td>
                  <td className="border p-2">{r.subjectId}</td>
                  <td className="border p-2">{formatTo12Hour(r.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PATTERN 5: Time-Based UI (Show Only During Class Hours)
// Best for: Showing/hiding UI based on time
// ============================================================================

export function Pattern5_TimeBasedUI() {
  const { currentTime } = useAttendance();

  const isClassTime = (() => {
    // Class hours: 09:00 - 16:30
    const minMinutes = 9 * 60; // 09:00
    const maxMinutes = 16.5 * 60; // 16:30
    const now = parseInt(currentTime.split(":")[0]) * 60 +
      parseInt(currentTime.split(":")[1]);
    return now >= minMinutes && now < maxMinutes;
  })();

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-3">Pattern 5: Time-Based UI</h3>
      <p className="text-sm mb-3">Current Time: {formatTo12Hour(currentTime)}</p>

      {isClassTime ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          ✅ Class hours active - Attendance marking is available
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          ❌ Outside class hours - Attendance marking is disabled
        </div>
      )}

      <pre className="bg-gray-100 p-3 mt-3 text-xs rounded">
{`// Usage:
const { currentTime } = useAttendance();

const isActive = checkTimeValidity("09:00", "16:30");
if (isActive) {
  return <MarkAttendanceForm />;
} else {
  return <div>Come back during class hours</div>;
}`}
      </pre>
    </div>
  );
}

// ============================================================================
// MAIN REFERENCE PAGE
// ============================================================================

export default function AttendanceExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Attendance System - Usage Patterns</h1>
        <p className="text-gray-600">
          Five different patterns for integrating the attendance system into your components
        </p>
      </div>

      <div className="space-y-4">
        <Pattern1_DirectFunctions />
        <Pattern2_ReactHook />
        <Pattern3_FullForm />
        <Pattern4_DataDisplay />
        <Pattern5_TimeBasedUI />
      </div>

      <div className="border-t mt-8 pt-6">
        <h2 className="text-xl font-bold mb-3">Quick Reference</h2>
        <ul className="text-sm space-y-2 list-disc list-inside">
          <li>Use Pattern 1 for simple, one-off operations</li>
          <li>Use Pattern 2 for most React components (recommended)</li>
          <li>Use Pattern 3 for full attendance marking forms</li>
          <li>Use Pattern 4 for viewing and exporting data</li>
          <li>Use Pattern 5 for conditional UI based on time</li>
        </ul>
      </div>
    </div>
  );
}
