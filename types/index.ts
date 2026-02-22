export interface Student {
  id: string;
  name: string;
  rollNo: string;
}

// Extended Student for Admin management
export interface AdminStudent {
  id: string;
  name: string;
  rollNo: string;
  batch: string;
  department: string;
  class: string;
  semester: number;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  students: Student[];
}

export interface Department {
  id: string;
  name: string;
  classes: Class[];
}

export interface Batch {
  id: string;
  name: string;
}

export type AttendanceStatus = "Present" | "Absent" | "On-Duty";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
}

export interface Period {
  id: number;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:50"
}

export interface Staff {
  id: string;
  name: string;
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface AttendanceSubmission {
  id: string;
  batch: string;
  department: string;
  class: string;
  semester: string;
  subject: string;
  subjectCode: string;
  periods: Period[]; // array of period objects with full time data
  date: string;
  time: string;
  staffId: string;
  staffName: string;
  attendance: AttendanceRecord[];
}
