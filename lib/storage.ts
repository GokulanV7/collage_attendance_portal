export interface StorageData {
  students: any[];
  attendanceRecords: any[];
  currentUser: any;
  authToken: string;
}

export const storage = {
  // Students
  setStudents(students: any[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("students", JSON.stringify(students));
    }
  },

  getStudents(): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("students");
    return data ? JSON.parse(data) : [];
  },

  getStudentsBySection(
    year: string,
    dept: string,
    cls: string,
    section: string,
  ): any[] {
    const students = this.getStudents();
    return students.filter(
      (s) =>
        s.year === year &&
        s.department === dept &&
        s.class === cls &&
        s.section === section,
    );
  },

  // Attendance
  saveAttendance(record: any) {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem("attendanceRecords") || "[]";
    const records = JSON.parse(existing);
    records.push(record);
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
  },

  getAttendance(filters?: any): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("attendanceRecords") || "[]";
    let records = JSON.parse(data);

    if (!filters) return records;

    if (filters.year)
      records = records.filter((r: any) => r.year === filters.year);
    if (filters.department)
      records = records.filter((r: any) => r.department === filters.department);
    if (filters.class)
      records = records.filter((r: any) => r.class === filters.class);
    if (filters.section)
      records = records.filter((r: any) => r.section === filters.section);
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      records = records.filter((r: any) => r.date >= start && r.date <= end);
    }

    return records;
  },

  clearAttendance() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("attendanceRecords");
    }
  },

  // Auth
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  setUser(user: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  },

  getUser(): any {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
    }
  },

  // Initialize from backend
  async initializeFromBackend() {
    if (typeof window === "undefined") return false;
    try {
      const response = await fetch("/api/data/init", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success && data.data?.students) {
        this.setStudents(data.data.students);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize from backend:", error);
      return false;
    }
  },
};
