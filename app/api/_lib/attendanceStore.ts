import { promises as fs } from "fs";
import path from "path";
import {
  getBatches,
  getClassesByDepartment,
  getDepartments,
  getSubjectsByDepartment,
} from "@/data/mockDatabase";

type NormalizedStatus = "present" | "absent" | "on-duty";

type AttendanceStudent = {
  student_id: string;
  roll_no: string;
  name: string;
  status: NormalizedStatus;
};

type AttendanceSubmissionRecord = {
  id: string;
  batch: string;
  department: string;
  section: string;
  class: string;
  semester: string;
  subject: string;
  subject_code: string;
  periods: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  }>;
  date: string;
  staff_id: string;
  staff_name: string;
  submitted_at: string;
  students: AttendanceStudent[];
};

type AttendanceDb = {
  submissions: AttendanceSubmissionRecord[];
};

type StudentMasterRecord = {
  id: string;
  rollNo: string;
  name: string;
  batch: string;
  department: string;
  section: string;
};

type SubmitAttendancePayload = {
  staffId?: string;
  staffName?: string;
  year?: string;
  batch?: string;
  department?: string;
  class?: string;
  section?: string;
  semester?: string;
  subject?: string;
  subjectCode?: string;
  periods?: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  }>;
  date?: string;
  attendance?: Record<string, string>;
  attendanceList?: Array<{
    studentId?: string;
    studentName?: string;
    rollNo?: string;
    status?: string;
  }>;
};

type AttendanceFilters = {
  batch?: string;
  year?: string;
  department?: string;
  class?: string;
  section?: string;
  subject?: string;
  subjectCode?: string;
  date?: string;
};

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "attendance-db.json");

let writeChain: Promise<void> = Promise.resolve();

const ensureDbFile = async (): Promise<void> => {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    const initial: AttendanceDb = { submissions: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
};

const readDb = async (): Promise<AttendanceDb> => {
  await ensureDbFile();
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(content) as AttendanceDb;
    if (!Array.isArray(parsed.submissions)) {
      return { submissions: [] };
    }
    return parsed;
  } catch {
    return { submissions: [] };
  }
};

const writeDb = async (db: AttendanceDb): Promise<void> => {
  await ensureDbFile();
  const tempFile = `${DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tempFile, DB_FILE);
};

const queueWrite = async <T>(operation: () => Promise<T>): Promise<T> => {
  const previous = writeChain;
  let release: () => void = () => {};
  writeChain = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
};

const normalizeStatus = (value: string | undefined): NormalizedStatus => {
  const normalized = (value || "present").toLowerCase();
  if (normalized === "absent") return "absent";
  if (normalized === "on-duty" || normalized === "onduty" || normalized === "on_duty") {
    return "on-duty";
  }
  return "present";
};

const toUiStatus = (value: NormalizedStatus): "Present" | "Absent" | "On-Duty" => {
  if (value === "absent") return "Absent";
  if (value === "on-duty") return "On-Duty";
  return "Present";
};

const normalizeSection = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.includes("-") ? (trimmed.split("-").pop() || trimmed).trim() : trimmed;
};

const buildMasterStudents = (): StudentMasterRecord[] => {
  const master: StudentMasterRecord[] = [];
  const batches = getBatches();

  batches.forEach((batch) => {
    const departments = getDepartments(batch.id);
    departments.forEach((department) => {
      const classes = getClassesByDepartment(batch.id, department.id);
      classes.forEach((classEntry) => {
        classEntry.students.forEach((student) => {
          master.push({
            id: student.id,
            rollNo: student.rollNo,
            name: student.name,
            batch: batch.id,
            department: department.id,
            section: classEntry.name,
          });
        });
      });
    });
  });

  return master;
};

let cachedMasterStudents: StudentMasterRecord[] | null = null;

export const getMasterStudents = (): StudentMasterRecord[] => {
  if (!cachedMasterStudents) {
    cachedMasterStudents = buildMasterStudents();
  }
  return cachedMasterStudents;
};

export const getStudentsByFilters = (filters: {
  year?: string;
  batch?: string;
  department?: string;
  class?: string;
  section?: string;
}) => {
  const batch = filters.batch || filters.year;
  const section = normalizeSection(filters.section || filters.class || "");

  return getMasterStudents().filter((student) => {
    if (batch && student.batch !== batch) return false;
    if (filters.department && student.department !== filters.department) return false;
    if (section && student.section !== section) return false;
    return true;
  });
};

const filterSubmissions = (
  submissions: AttendanceSubmissionRecord[],
  filters: AttendanceFilters,
): AttendanceSubmissionRecord[] => {
  const batch = filters.batch || filters.year;
  const section = normalizeSection(filters.section || filters.class || "");

  return submissions.filter((record) => {
    if (batch && record.batch !== batch) return false;
    if (filters.department && record.department !== filters.department) return false;
    if (section && record.section !== section) return false;
    if (filters.date && record.date !== filters.date) return false;

    const normalizedSubjectCode = filters.subjectCode || "";
    if (normalizedSubjectCode && record.subject_code !== normalizedSubjectCode) return false;

    const normalizedSubject = filters.subject || "";
    if (normalizedSubject && record.subject !== normalizedSubject) return false;

    return true;
  });
};

export const upsertAttendanceSubmission = async (payload: SubmitAttendancePayload) => {
  return queueWrite(async () => {
    const batch = (payload.batch || payload.year || "").trim();
    const department = (payload.department || "").trim();
    const section = normalizeSection(payload.section || payload.class || "");
    const className = normalizeSection(payload.class || payload.section || "");
    const subject = (payload.subject || "").trim();
    const subjectCode = (payload.subjectCode || "").trim();
    const periods = Array.isArray(payload.periods) ? payload.periods : [];
    const date = (payload.date || new Date().toISOString().split("T")[0]).trim();
    const staffId = (payload.staffId || "").trim();
    const staffName = (payload.staffName || staffId || "").trim();

    if (!batch || !department || !section || !subject || !subjectCode || !date || !staffId) {
      throw new Error("Missing required fields: batch, department, section, subject, subjectCode, date, staffId");
    }

    const roster = getStudentsByFilters({ batch, department, section });
    if (roster.length === 0) {
      throw new Error("No students found for the selected batch, department, and section");
    }

    const statusByRoll = new Map<string, NormalizedStatus>();
    const statusById = new Map<string, NormalizedStatus>();

    if (Array.isArray(payload.attendanceList) && payload.attendanceList.length > 0) {
      payload.attendanceList.forEach((entry) => {
        if (entry.rollNo) {
          statusByRoll.set(entry.rollNo, normalizeStatus(entry.status));
        }
        if (entry.studentId) {
          statusById.set(entry.studentId, normalizeStatus(entry.status));
        }
      });
    }

    Object.entries(payload.attendance || {}).forEach(([key, value]) => {
      statusByRoll.set(key, normalizeStatus(value));
    });

    const students: AttendanceStudent[] = roster.map((student) => {
      const status =
        statusById.get(student.id) ||
        statusByRoll.get(student.rollNo) ||
        "present";

      return {
        student_id: student.id,
        roll_no: student.rollNo,
        name: student.name,
        status,
      };
    });

    const db = await readDb();

    const existingIndex = db.submissions.findIndex(
      (record) =>
        record.batch === batch &&
        record.department === department &&
        record.section === section &&
        record.subject_code === subjectCode &&
        record.date === date,
    );

    const record: AttendanceSubmissionRecord = {
      id:
        existingIndex >= 0
          ? db.submissions[existingIndex].id
          : `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      batch,
      department,
      section,
      class: className,
      semester: payload.semester || "",
      subject,
      subject_code: subjectCode,
      periods,
      date,
      staff_id: staffId,
      staff_name: staffName,
      submitted_at: new Date().toISOString(),
      students,
    };

    if (existingIndex >= 0) {
      db.submissions[existingIndex] = record;
    } else {
      db.submissions.push(record);
    }

    await writeDb(db);
    return { record, updated: existingIndex >= 0 };
  });
};

export const getAttendanceRecords = async (filters: AttendanceFilters = {}) => {
  const db = await readDb();
  return filterSubmissions(db.submissions, filters);
};

export const getAttendanceRows = async (filters: AttendanceFilters = {}) => {
  const records = await getAttendanceRecords(filters);

  return records.flatMap((record) =>
    record.students.map((student) => ({
      batch: record.batch,
      department: record.department,
      section: record.section,
      subject: record.subject,
      subject_code: record.subject_code,
      date: record.date,
      staff_id: record.staff_id,
      student_id: student.student_id,
      name: student.name,
      status: student.status,
      roll_no: student.roll_no,
    })),
  );
};

export const getAttendanceOverview = async (filters: AttendanceFilters = {}) => {
  const records = await getAttendanceRecords(filters);

  const transformed = records.map((record) => ({
    id: record.id,
    batch: record.batch,
    department: record.department,
    class: record.class,
    section: record.section,
    semester: record.semester,
    subject: record.subject,
    subjectCode: record.subject_code,
    periods: Array.isArray(record.periods) ? record.periods : [],
    date: record.date,
    staffId: record.staff_id,
    staffName: record.staff_name,
    submittedAt: record.submitted_at,
    attendance: record.students.map((student) => ({
      studentId: student.student_id,
      studentName: student.name,
      rollNo: student.roll_no,
      status: toUiStatus(student.status),
    })),
  }));

  return transformed;
};

export const getSections = (year: string, department: string) => {
  const sections = new Set(
    getStudentsByFilters({ year, department }).map((student) => student.section),
  );
  return Array.from(sections).sort();
};

export const getSubjects = (department: string) => {
  return getSubjectsByDepartment(department).map((subject) => ({
    code: subject.code,
    name: subject.name,
  }));
};

export const getSubjectStatusByDate = async (params: {
  year: string;
  department: string;
  section: string;
  date: string;
}) => {
  const records = await getAttendanceRecords({
    year: params.year,
    department: params.department,
    section: params.section,
    date: params.date,
  });

  const subjectList = getSubjects(params.department);
  return subjectList.map((subject) => {
    const matched = records.find((record) => record.subject_code === subject.code);
    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      status: matched ? "Marked" : "Not Marked",
      markedBy: matched?.staff_name || null,
      markedAt: matched?.submitted_at || null,
      date: params.date,
    };
  });
};

export const getAttendanceDetail = async (params: {
  year: string;
  department: string;
  section: string;
  subjectCode: string;
  date: string;
}) => {
  const records = await getAttendanceRecords({
    year: params.year,
    department: params.department,
    section: params.section,
    subjectCode: params.subjectCode,
    date: params.date,
  });

  const matched = records[0];
  const roster = getStudentsByFilters({
    year: params.year,
    department: params.department,
    section: params.section,
  });

  const statusMap = new Map<string, NormalizedStatus>();
  if (matched) {
    matched.students.forEach((student) => {
      statusMap.set(student.roll_no, student.status);
    });
  }

  return {
    marked: !!matched,
    markedBy: matched?.staff_name || null,
    date: params.date,
    section: params.section,
    subjectCode: params.subjectCode,
    studentAttendance: roster.map((student) => ({
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.name,
      status: matched ? toUiStatus(statusMap.get(student.rollNo) || "present") : "Not Marked",
    })),
  };
};

export const getOverallStats = async (params: {
  year: string;
  department: string;
  section: string;
  subjectCode: string;
}) => {
  const roster = getStudentsByFilters({
    year: params.year,
    department: params.department,
    section: params.section,
  });

  const records = await getAttendanceRecords({
    year: params.year,
    department: params.department,
    section: params.section,
    subjectCode: params.subjectCode,
  });

  const totalClassesConducted = records.length;

  const students = roster.map((student) => {
    let presentCount = 0;
    let absentCount = 0;

    records.forEach((record) => {
      const matched = record.students.find((s) => s.roll_no === student.rollNo);
      const status = matched?.status || "present";
      if (status === "absent") {
        absentCount += 1;
      } else {
        presentCount += 1;
      }
    });

    const attendancePercentage =
      totalClassesConducted > 0
        ? Number(((presentCount / totalClassesConducted) * 100).toFixed(2))
        : 0;

    return {
      student_id: student.id,
      student_name: student.name,
      roll_no: student.rollNo,
      total_classes: totalClassesConducted,
      present_count: presentCount,
      absent_count: absentCount,
      attendance_percentage: attendancePercentage,
    };
  });

  return {
    total_classes_conducted: totalClassesConducted,
    students,
  };
};

export const getDataStructure = () => ({
  years: getBatches().map((batch) => batch.id),
  departments: ["CSE", "IT", "ECE", "ME", "AIML"],
  classes: ["A", "B", "C"],
  sections: ["A", "B", "C"],
  studentsPerSection: 20,
});

export const getInitData = () => {
  const students = getMasterStudents().map((student) => ({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    batch: student.batch,
    department: student.department,
    class: student.section,
    semester: 1,
    createdAt: new Date().toISOString(),
  }));

  return {
    studentsCount: students.length,
    students,
    staffCount: 0,
    adminsCount: 0,
    staff: [],
    admins: [],
  };
};
