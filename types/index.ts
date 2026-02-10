export interface Student {
  id: string;
  name: string;
  rollNo: string;
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

export interface AttendanceSubmission {
  id: string;
  batch: string;
  department: string;
  class: string;
  periods: number[]; // array of period IDs
  date: string;
  time: string;
  staffId: string;
  staffName: string;
  attendance: AttendanceRecord[];
}
