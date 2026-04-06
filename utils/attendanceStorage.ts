/**
 * Local Attendance Storage Utility
 * Manages date-based attendance records in localStorage
 * Demo-friendly for HOD showcase without backend
 */

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  period: string; // e.g., "Period 1", "Period 2"
  staffId?: string;
  staffName?: string;
}

const STORAGE_KEY = "attendanceRecords";

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get current time in HH:MM format (24-hour)
 */
export const getCurrentTimeFormatted = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Convert 24-hour HH:MM to 12-hour format with AM/PM
 */
export const formatTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if current time is within a valid class period
 * Returns true if time is valid, false otherwise
 */
export const checkTimeValidity = (
  periodStartTime: string,
  periodEndTime: string,
  currentTime?: string
): boolean => {
  const time = currentTime || getCurrentTimeFormatted();
  const currentMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(periodStartTime);
  const endMinutes = timeToMinutes(periodEndTime);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Get all stored attendance records
 */
export const getAllAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading attendance records:", error);
    return [];
  }
};

/**
 * Get today's attendance records
 */
export const getTodayAttendance = (): AttendanceRecord[] => {
  const today = getTodayDate();
  const all = getAllAttendanceRecords();
  return all.filter((record) => record.date === today);
};

/**
 * Get attendance records for a specific date
 */
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  const all = getAllAttendanceRecords();
  return all.filter((record) => record.date === date);
};

/**
 * Check if duplicate attendance exists for today
 * Duplicate = same studentId + subjectId + date
 */
export const checkDuplicateAttendance = (
  studentId: string,
  subjectId: string,
  date?: string
): AttendanceRecord | null => {
  const checkDate = date || getTodayDate();
  const all = getAllAttendanceRecords();

  const duplicate = all.find(
    (record) =>
      record.studentId === studentId &&
      record.subjectId === subjectId &&
      record.date === checkDate
  );

  return duplicate || null;
};

/**
 * Save a single attendance record
 * Automatically appends to localStorage
 */
export const saveAttendance = (record: Omit<AttendanceRecord, "date" | "time">): AttendanceRecord => {
  const fullRecord: AttendanceRecord = {
    ...record,
    date: getTodayDate(),
    time: getCurrentTimeFormatted(),
  };

  try {
    const allRecords = getAllAttendanceRecords();
    allRecords.push(fullRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    return fullRecord;
  } catch (error) {
    console.error("Error saving attendance:", error);
    throw new Error("Failed to save attendance");
  }
};

/**
 * Save multiple attendance records at once (batch operation)
 */
export const saveAttendanceBatch = (
  records: Omit<AttendanceRecord, "date" | "time">[]
): AttendanceRecord[] => {
  const today = getTodayDate();
  const now = getCurrentTimeFormatted();

  const fullRecords = records.map((record) => ({
    ...record,
    date: today,
    time: now,
  }));

  try {
    const allRecords = getAllAttendanceRecords();
    const combined = [...allRecords, ...fullRecords];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    return fullRecords;
  } catch (error) {
    console.error("Error saving batch attendance:", error);
    throw new Error("Failed to save batch attendance");
  }
};

/**
 * Clear all attendance records (for demo reset)
 */
export const clearAllAttendance = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing attendance:", error);
    throw new Error("Failed to clear attendance records");
  }
};

/**
 * Clear today's attendance records
 */
export const clearTodayAttendance = (): void => {
  try {
    const today = getTodayDate();
    const all = getAllAttendanceRecords();
    const filtered = all.filter((record) => record.date !== today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error clearing today's attendance:", error);
    throw new Error("Failed to clear today's attendance");
  }
};

/**
 * Delete a specific attendance record by index
 */
export const deleteAttendanceRecord = (index: number): void => {
  try {
    const all = getAllAttendanceRecords();
    all.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw new Error("Failed to delete attendance record");
  }
};

/**
 * Get attendance summary for a specific date
 */
export const getAttendanceSummary = (date?: string) => {
  const checkDate = date || getTodayDate();
  const records = getAttendanceByDate(checkDate);

  const summary = {
    date: checkDate,
    total: records.length,
    bySubject: {} as Record<string, number>,
    byStudent: {} as Record<string, number>,
    records,
  };

  records.forEach((record) => {
    summary.bySubject[record.subjectId] =
      (summary.bySubject[record.subjectId] || 0) + 1;
    summary.byStudent[record.studentId] =
      (summary.byStudent[record.studentId] || 0) + 1;
  });

  return summary;
};

/**
 * Export attendance records as JSON (for demo/debug)
 */
export const exportAttendanceData = (): string => {
  const all = getAllAttendanceRecords();
  return JSON.stringify(all, null, 2);
};

/**
 * Import attendance records from JSON (for demo/debug)
 */
export const importAttendanceData = (jsonData: string): number => {
  try {
    const records = JSON.parse(jsonData);
    if (!Array.isArray(records)) {
      throw new Error("Invalid format");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return records.length;
  } catch (error) {
    console.error("Error importing attendance data:", error);
    throw new Error("Failed to import attendance data");
  }
};
