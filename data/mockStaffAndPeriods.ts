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

// Period timings
export const periods: Period[] = [
  { id: 1, name: "Period 1", startTime: "09:00", endTime: "09:50" },
  { id: 2, name: "Period 2", startTime: "09:50", endTime: "10:40" },
  { id: 3, name: "Period 3", startTime: "10:50", endTime: "11:40" },
  { id: 4, name: "Period 4", startTime: "11:40", endTime: "12:30" },
  { id: 5, name: "Period 5", startTime: "13:30", endTime: "14:20" },
  { id: 6, name: "Period 6", startTime: "14:20", endTime: "15:10" },
  { id: 7, name: "Period 7", startTime: "15:20", endTime: "16:10" },
  { id: 8, name: "Period 8", startTime: "16:10", endTime: "17:00" },
];

// Helper functions
export const validateStaffId = (staffId: string): Staff | null => {
  const staff = staffData.find((s) => s.id === staffId);
  return staff || null;
};

export const getPeriods = (): Period[] => {
  return periods;
};

export const getStaffById = (staffId: string): Staff | undefined => {
  return staffData.find((s) => s.id === staffId);
};
