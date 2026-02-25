import { Batch, Department, Student, Class, Subject, AdminStudent } from "@/types";

// Subjects by department
const subjectsByDepartment: Record<string, Subject[]> = {
  CSE: [
    { id: "CSE101", name: "Data Structures", code: "CS101" },
    { id: "CSE102", name: "Database Management Systems", code: "CS102" },
    { id: "CSE103", name: "Operating Systems", code: "CS103" },
    { id: "CSE104", name: "Computer Networks", code: "CS104" },
    { id: "CSE105", name: "Software Engineering", code: "CS105" },
    { id: "CSE106", name: "Web Technologies", code: "CS106" },
    { id: "CSE107", name: "Machine Learning", code: "CS107" },
    { id: "CSE108", name: "Artificial Intelligence", code: "CS108" },
  ],
  IT: [
    { id: "IT101", name: "Information Security", code: "IT101" },
    { id: "IT102", name: "Cloud Computing", code: "IT102" },
    { id: "IT103", name: "Mobile Application Development", code: "IT103" },
    { id: "IT104", name: "Data Analytics", code: "IT104" },
    { id: "IT105", name: "Internet of Things", code: "IT105" },
    { id: "IT106", name: "Big Data Technologies", code: "IT106" },
    { id: "IT107", name: "Network Administration", code: "IT107" },
    { id: "IT108", name: "System Analysis & Design", code: "IT108" },
  ],
  ECE: [
    { id: "ECE101", name: "Digital Electronics", code: "EC101" },
    { id: "ECE102", name: "Signal Processing", code: "EC102" },
    { id: "ECE103", name: "Communication Systems", code: "EC103" },
    { id: "ECE104", name: "VLSI Design", code: "EC104" },
    { id: "ECE105", name: "Embedded Systems", code: "EC105" },
    { id: "ECE106", name: "Microprocessors", code: "EC106" },
    { id: "ECE107", name: "Antenna Theory", code: "EC107" },
    { id: "ECE108", name: "Control Systems", code: "EC108" },
  ],
  ME: [
    { id: "ME101", name: "Thermodynamics", code: "ME101" },
    { id: "ME102", name: "Fluid Mechanics", code: "ME102" },
    { id: "ME103", name: "Machine Design", code: "ME103" },
    { id: "ME104", name: "Manufacturing Processes", code: "ME104" },
    { id: "ME105", name: "Heat Transfer", code: "ME105" },
    { id: "ME106", name: "Automobile Engineering", code: "ME106" },
    { id: "ME107", name: "CAD/CAM", code: "ME107" },
    { id: "ME108", name: "Robotics", code: "ME108" },
  ],
  AIML: [
    { id: "AIML101", name: "Introduction to AI", code: "AI101" },
    { id: "AIML102", name: "Deep Learning", code: "AI102" },
    { id: "AIML103", name: "Natural Language Processing", code: "AI103" },
    { id: "AIML104", name: "Computer Vision", code: "AI104" },
    { id: "AIML105", name: "Reinforcement Learning", code: "AI105" },
    { id: "AIML106", name: "Neural Networks", code: "AI106" },
    { id: "AIML107", name: "Pattern Recognition", code: "AI107" },
    { id: "AIML108", name: "AI Ethics", code: "AI108" },
  ],
};

// Department labels
const departmentLabels: Record<string, string> = {
  CSE: "Computer Science Engineering",
  IT: "Information Technology",
  ECE: "Electronics and Communication Engineering",
  ME: "Mechanical Engineering",
  AIML: "Artificial Intelligence & ML",
};

// Available batches and department IDs (structural config, not student data)
export const batches: Batch[] = [
  { id: "2021-2025", name: "2021–2025" },
  { id: "2022-2026", name: "2022–2026" },
  { id: "2023-2027", name: "2023–2027" },
  { id: "2024-2028", name: "2024–2028" },
  { id: "2025-2029", name: "2025–2029" },
];

const DEPARTMENT_IDS = ["CSE", "IT", "ECE", "ME", "AIML"];

// Helper: read real admin students from sessionStorage
const getAdminStudents = (): AdminStudent[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("admin_students");
    if (!stored) return [];
    return JSON.parse(stored) as AdminStudent[];
  } catch {
    return [];
  }
};

// Map between class ID (e.g. CSE-A) and admin class name (e.g. Section A)
const classIdToName = (classId: string): string => {
  const letter = classId.split("-").pop();
  return letter ? `Section ${letter}` : "";
};

export const getBatches = (): Batch[] => {
  return batches;
};

export const getDepartments = (batchId?: string): Department[] => {
  // Return department list with empty classes — classes are derived from real data
  return DEPARTMENT_IDS.map((deptId) => ({
    id: deptId,
    name: departmentLabels[deptId] || deptId,
    classes: getClassesByDepartment(batchId || "", deptId),
  }));
};

// Helper: read manually created class names from sessionStorage
const getCreatedClassNames = (batchId: string, departmentId: string): string[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("admin_class_names");
    if (!stored) return [];
    const all = JSON.parse(stored) as Record<string, string[]>;
    return all[`${batchId}_${departmentId}`] || [];
  } catch {
    return [];
  }
};

export const getClassesByDepartment = (
  batchId: string,
  departmentId: string
): Class[] => {
  // Derive classes dynamically from real uploaded students
  const adminStudents = getAdminStudents();
  const relevantStudents = adminStudents.filter(
    (s) =>
      s.batch === batchId &&
      s.department.toUpperCase() === departmentId.toUpperCase()
  );

  // Extract unique class names from students (e.g. "Section A", "Section C")
  const studentClassNames = [...new Set(relevantStudents.map((s) => s.class))];

  // Also include manually created classes from admin_class_names
  const createdClassNames = getCreatedClassNames(batchId, departmentId);

  // Merge both sources and include the default "Section A"
  const allClassNames = [...new Set(["Section A", ...studentClassNames, ...createdClassNames])].sort();

  if (allClassNames.length > 0) {
    return allClassNames.map((className) => {
      // Extract letter from "Section A" -> "A"
      const letter = className.replace(/^Section\s+/i, "").toUpperCase();
      return {
        id: `${departmentId}-${letter}`,
        name: letter,
        students: [],
      };
    });
  }

  // Default: return A and B if no students uploaded yet
  return [
    { id: `${departmentId}-A`, name: "A", students: [] },
    { id: `${departmentId}-B`, name: "B", students: [] },
  ];
};

export const getStudentsByClass = (
  batchId: string,
  departmentId: string,
  classId: string
): Student[] => {
  const adminStudents = getAdminStudents();
  const adminClassName = classIdToName(classId); // e.g. "Section A"
  const classLetter = classId.split("-").pop()?.toUpperCase() || "";

  // Read semester from session if available
  const selectedSemester =
    typeof window !== "undefined"
      ? sessionStorage.getItem("selectedSemester")
      : null;

  // Filter admin students by batch, department, class, and semester
  const filtered = adminStudents.filter((s) => {
    const matchBatch = s.batch === batchId;
    const matchDept = s.department.toUpperCase() === departmentId.toUpperCase();
    // Match class: support both "Section A" and just the letter
    const sClassUpper = s.class.toUpperCase();
    const matchClass =
      s.class === adminClassName ||
      sClassUpper === classLetter ||
      sClassUpper === `SECTION ${classLetter}`;
    const matchSemester = selectedSemester
      ? s.semester === parseInt(selectedSemester)
      : true;
    return matchBatch && matchDept && matchClass && matchSemester;
  });

  // Convert AdminStudent to Student type
  return filtered.map((s) => ({
    id: s.id,
    name: s.name,
    rollNo: s.rollNo,
  }));
};

export const getSubjectsByDepartment = (departmentId: string): Subject[] => {
  return subjectsByDepartment[departmentId] || [];
};
