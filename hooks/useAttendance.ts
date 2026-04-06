/**
 * Custom React Hook for Attendance Management
 * Provides easy access to attendance operations with state management
 */

import { useCallback, useState, useEffect } from "react";
import {
  AttendanceRecord,
  getTodayDate,
  getCurrentTimeFormatted,
  checkTimeValidity,
  checkDuplicateAttendance,
  saveAttendance,
  getTodayAttendance,
  clearAllAttendance,
  clearTodayAttendance,
  getAttendanceByDate,
  getAttendanceSummary,
  getAllAttendanceRecords,
} from "./attendanceStorage";

interface UseAttendanceReturn {
  // State
  todayAttendance: AttendanceRecord[];
  currentDate: string;
  currentTime: string;

  // Actions
  markAttendance: (studentId: string, studentName: string, subjectId: string, period: string) => {
    success: boolean;
    message: string;
  };
  checkTimeValid: (startTime: string, endTime: string) => boolean;
  checkDuplicate: (studentId: string, subjectId: string, date?: string) => boolean;

  // Data Access
  getTodayRecords: () => AttendanceRecord[];
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getSummary: (date?: string) => any;
  getAllRecords: () => AttendanceRecord[];

  // Demo Operations
  clearToday: () => void;
  clearAll: () => void;
  reloadToday: () => void;
}

/**
 * Hook for managing attendance with localStorage
 * Handles time validation, duplicate checking, and data persistence
 */
export const useAttendance = (): UseAttendanceReturn => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [currentDate] = useState(getTodayDate());
  const [currentTime, setCurrentTime] = useState(getCurrentTimeFormatted());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load today's attendance on mount
  useEffect(() => {
    reloadToday();
  }, []);

  const reloadToday = useCallback(() => {
    const records = getTodayAttendance();
    setTodayAttendance(records);
  }, []);

  const markAttendance = useCallback(
    (studentId: string, studentName: string, subjectId: string, period: string) => {
      // Check for duplicates
      if (checkDuplicateAttendance(studentId, subjectId, currentDate)) {
        return {
          success: false,
          message: "Attendance already marked for today",
        };
      }

      try {
        saveAttendance({
          studentId,
          studentName,
          subjectId,
          period,
        });

        reloadToday();
        return {
          success: true,
          message: `Attendance marked for ${studentName}`,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to mark attendance",
        };
      }
    },
    [currentDate, reloadToday]
  );

  const checkTimeValid = useCallback((startTime: string, endTime: string) => {
    return checkTimeValidity(startTime, endTime, currentTime);
  }, [currentTime]);

  const checkDuplicate = useCallback(
    (studentId: string, subjectId: string, date?: string) => {
      return !!checkDuplicateAttendance(studentId, subjectId, date);
    },
    []
  );

  const getTodayRecords = useCallback(() => {
    return getTodayAttendance();
  }, []);

  const getRecordsByDate = useCallback((date: string) => {
    return getAttendanceByDate(date);
  }, []);

  const getSummary = useCallback((date?: string) => {
    return getAttendanceSummary(date);
  }, []);

  const getAllRecords = useCallback(() => {
    return getAllAttendanceRecords();
  }, []);

  const clearToday = useCallback(() => {
    clearTodayAttendance();
    reloadToday();
  }, [reloadToday]);

  const clearAll = useCallback(() => {
    clearAllAttendance();
    reloadToday();
  }, [reloadToday]);

  return {
    todayAttendance,
    currentDate,
    currentTime,
    markAttendance,
    checkTimeValid,
    checkDuplicate,
    getTodayRecords,
    getRecordsByDate,
    getSummary,
    getAllRecords,
    clearToday,
    clearAll,
    reloadToday,
  };
};

export default useAttendance;
