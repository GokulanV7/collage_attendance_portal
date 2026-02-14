import { Staff, Period } from "@/types";

// Staff data
export const staffData: Staff[] = [
  { id: "STAFF001", name: "Dr. Rajesh Kumar", department: "CSE" },
  { id: "STAFF002", name: "Prof. Priya Sharma", department: "CSE" },
  { id: "STAFF003", name: "Dr. Arun Menon", department: "IT" },
  { id: "STAFF004", name: "Prof. Lakshmi Iyer", department: "IT" },
  { id: "STAFF005", name: "Dr. Suresh Reddy", department: "ECE" },
  { id: "STAFF006", name: "Prof. Kavya Nair", department: "ECE" },
  { id: "STAFF007", name: "Dr. Manoj Singh", department: "ME" },
  { id: "STAFF008", name: "Prof. Deepa Rao", department: "ME" },
  { id: "STAFF009", name: "Dr. Ganesh Murthy", department: "CSE" },
  { id: "STAFF010", name: "Prof. Ananya Patel", department: "IT" },
];

// 45-minute period timings
export const periods45Min: Period[] = [
  { id: 1, name: "Period 1", startTime: "09:00", endTime: "09:45" },
  { id: 2, name: "Period 2", startTime: "09:45", endTime: "10:30" },
  { id: 3, name: "Period 3", startTime: "10:45", endTime: "11:30" },
  { id: 4, name: "Period 4", startTime: "11:30", endTime: "12:15" },
  { id: 5, name: "Period 5", startTime: "13:30", endTime: "14:15" },
  { id: 6, name: "Period 6", startTime: "14:15", endTime: "15:00" },
  { id: 7, name: "Period 7", startTime: "15:15", endTime: "16:00" },
  { id: 8, name: "Period 8", startTime: "16:00", endTime: "16:45" },
];

// 1-hour period timings
export const periods1Hour: Period[] = [
  { id: 1, name: "Period 1", startTime: "09:00", endTime: "10:00" },
  { id: 2, name: "Period 2", startTime: "10:00", endTime: "11:00" },
  { id: 3, name: "Period 3", startTime: "11:15", endTime: "12:15" },
  { id: 4, name: "Period 4", startTime: "12:15", endTime: "13:15" },
  { id: 5, name: "Period 5", startTime: "14:00", endTime: "15:00" },
  { id: 6, name: "Period 6", startTime: "15:00", endTime: "16:00" },
  { id: 7, name: "Period 7", startTime: "16:15", endTime: "17:15" },
  { id: 8, name: "Period 8", startTime: "17:15", endTime: "18:15" },
];

// Default periods (kept for backwards compatibility)
export const periods: Period[] = periods45Min;

// Helper functions
export const validateStaffId = (staffId: string): Staff | null => {
  const staff = staffData.find((s) => s.id === staffId);
  return staff || null;
};

export const getPeriods = (duration?: "45min" | "1hour"): Period[] => {
  if (duration === "1hour") return periods1Hour;
  return periods45Min;
};

export const getStaffById = (staffId: string): Staff | undefined => {
  return staffData.find((s) => s.id === staffId);
};
