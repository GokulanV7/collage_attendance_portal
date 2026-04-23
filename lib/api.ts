interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

const API_URL = "/api";

async function request(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = "API Error";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Keep generic message when response is not valid JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Data Initialization
  async initData() {
    return request("/data/init", { method: "POST" });
  },

  async getDataStructure() {
    return request("/data/structure");
  },

  // Students
  async getStudents(year: string, dept: string, cls: string, section: string) {
    return request(
      `/students?year=${year}&department=${dept}&class=${cls}&section=${section}`,
    );
  },

  async getAllStudents() {
    return request("/students/all");
  },

  // Attendance
  async submitAttendance(data: any) {
    return request("/attendance", {
      method: "POST",
      body: data,
    });
  },

  async getAttendance(filters?: any) {
    let url = "/attendance";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.department) params.append("department", filters.department);
      if (filters.class) params.append("class", filters.class);
      if (filters.section) params.append("section", filters.section);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.subjectCode) params.append("subjectCode", filters.subjectCode);
      if (filters.date) params.append("date", filters.date);
      url += `?${params.toString()}`;
    }
    return request(url);
  },

  async getAttendanceBySection(
    year: string,
    dept: string,
    cls: string,
    section: string,
  ) {
    return request(
      `/attendance/by-section?year=${year}&department=${dept}&class=${cls}&section=${section}`,
    );
  },

  async getAttendanceSections(year: string, department: string) {
    return request(
      `/attendance/sections?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}`,
    );
  },

  async getAttendanceSubjects(department: string) {
    return request(`/attendance/subjects?department=${encodeURIComponent(department)}`);
  },

  async getSubjectAttendanceStatus(
    year: string,
    department: string,
    section: string,
    date: string,
  ) {
    return request(
      `/attendance/subject-status?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}&date=${encodeURIComponent(date)}`,
    );
  },

  async getAttendanceDetail(
    year: string,
    department: string,
    section: string,
    subjectCode: string,
    date: string,
  ) {
    return request(
      `/attendance/detail?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}&subjectCode=${encodeURIComponent(subjectCode)}&date=${encodeURIComponent(date)}`,
    );
  },

  async getOverallAttendanceStats(
    year: string,
    department: string,
    section: string,
    subjectCode: string,
  ) {
    return request(
      `/attendance/overall-stats?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}&subjectCode=${encodeURIComponent(subjectCode)}`,
    );
  },
};
