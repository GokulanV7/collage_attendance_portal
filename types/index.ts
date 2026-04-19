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
  batchId?: string;
  batch: string;
  departmentId?: string;
  department: string;
  classId?: string;
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

// ===== Subject Management Types =====

export interface Semester {
  id: string;
  name: string; // "Semester 1", "Semester 2", etc.
  batchId: string; // Reference to batch
  departmentId: string; // Reference to department
  year: number; // 1, 2, 3, 4
  startDate: string; // "2024-01-15"
  endDate: string; // "2024-05-30"
  createdAt?: string;
  updatedAt?: string;
}

export interface ManagedSubject {
  id: string;
  code: string; // "CS101", "CS102"
  name: string; // "Data Structures", "Database"
  semesterId: string; // Reference to semester
  credits: number; // 3, 4
  departmentId: string; // Reference to department
  faculty?: string; // Optional faculty name
  periods?: Period[]; // Assigned time slots
  classesAssigned: string[]; // ["ClassA", "ClassB"]
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSubjectMapping {
  id: string;
  classId: string;
  subjectId: string;
  semesterId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
