interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    const error = await response.json();
    throw new Error(error.message || "API Error");
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
    return request("/attendance/submit", {
      method: "POST",
      body: data,
    });
  },

  async getAttendance(filters?: any) {
    let url = "/attendance/all";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.department) params.append("department", filters.department);
      if (filters.class) params.append("class", filters.class);
      if (filters.section) params.append("section", filters.section);
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
};
