// User Types
export interface Student {
  id: string;
  rollNo: string;
  name: string;
  year: string; // 2021-2025, 2022-2026, 2023-2027
  department: string; // CSE, IT, ECE, ME
  class: string; // A, B, C
  section: string; // 1, 2
  email: string;
  phone: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  staffId: string; // ST001, ST002, etc.
  password: string;
  role: "staff" | "admin";
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  email: string;
  role: "admin";
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  staffId: string;
  year: string;
  department: string;
  class: string;
  section: string;
  date: string; // YYYY-MM-DD
  attendance: {
    [studentId: string]: "present" | "absent" | "on-duty";
  };
  submittedAt: string;
  submittedBy: string;
  notes?: string;
}

// Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  id: string; // Staff ID or Admin code
  password: string;
}

export interface SubmitAttendanceRequest {
  staffId: string;
  year: string;
  department: string;
  class: string;
  section: string;
  attendance: { [key: string]: string };
}
