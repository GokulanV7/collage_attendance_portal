import { Batch, Class, Department, Student, Subject } from "@/types";

const STUDENTS_PER_CLASS = 20;

const BATCHES: Batch[] = [
  { id: "2021-2025", name: "2021-2025" },
  { id: "2022-2026", name: "2022-2026" },
  { id: "2023-2027", name: "2023-2027" },
];

const DEPARTMENTS = [
  { id: "CSE", name: "Computer Science Engineering" },
  { id: "IT", name: "Information Technology" },
  { id: "ECE", name: "Electronics and Communication Engineering" },
  { id: "ME", name: "Mechanical Engineering" },
  { id: "AIML", name: "Artificial Intelligence and Machine Learning" },
];

const CLASS_NAMES = ["A", "B", "C"];

const FIRST_NAMES = [
  "Aarav",
  "Ishita",
  "Karan",
  "Meera",
  "Rohan",
  "Priya",
  "Vikram",
  "Sneha",
  "Arjun",
  "Neha",
  "Varun",
  "Kavya",
  "Naveen",
  "Pooja",
  "Rahul",
  "Asha",
  "Karthik",
  "Divya",
  "Nikhil",
  "Ananya",
];

const LAST_NAMES = [
  "Sharma",
  "Kumar",
  "Reddy",
  "Iyer",
  "Nair",
  "Patel",
  "Joshi",
  "Menon",
  "Das",
  "Gupta",
  "Singh",
  "Rao",
  "Thomas",
  "Bhat",
  "Mishra",
  "Verma",
  "Jain",
  "Paul",
  "Roy",
  "Khan",
];

const SUBJECTS_BY_DEPT: Record<string, Subject[]> = {
  CSE: [
    { id: "CSE-OS", name: "Operating Systems", code: "CS301" },
    { id: "CSE-DBMS", name: "Database Management Systems", code: "CS302" },
    { id: "CSE-CN", name: "Computer Networks", code: "CS303" },
    { id: "CSE-SE", name: "Software Engineering", code: "CS304" },
  ],
  IT: [
    { id: "IT-WT", name: "Web Technologies", code: "IT301" },
    { id: "IT-CC", name: "Cloud Computing", code: "IT302" },
    { id: "IT-IS", name: "Information Security", code: "IT303" },
    { id: "IT-DAA", name: "Design and Analysis of Algorithms", code: "IT304" },
  ],
  ECE: [
    { id: "ECE-DS", name: "Digital Signal Processing", code: "EC301" },
    { id: "ECE-VLSI", name: "VLSI Design", code: "EC302" },
    { id: "ECE-DC", name: "Digital Communication", code: "EC303" },
    { id: "ECE-ME", name: "Microelectronics", code: "EC304" },
  ],
  ME: [
    { id: "ME-TM", name: "Thermal Engineering", code: "ME301" },
    { id: "ME-MD", name: "Machine Design", code: "ME302" },
    { id: "ME-FM", name: "Fluid Mechanics", code: "ME303" },
    { id: "ME-IM", name: "Industrial Management", code: "ME304" },
  ],
  AIML: [
    { id: "AIML-ML", name: "Machine Learning", code: "AI301" },
    { id: "AIML-DL", name: "Deep Learning", code: "AI302" },
    { id: "AIML-NLP", name: "Natural Language Processing", code: "AI303" },
    { id: "AIML-CV", name: "Computer Vision", code: "AI304" },
  ],
};

type Dataset = Record<string, Department[]>;

const buildStudents = (batchId: string, deptId: string, className: string): Student[] => {
  const batchCode = batchId.slice(2, 4);
  return Array.from({ length: STUDENTS_PER_CLASS }, (_, index) => {
    const number = (index + 1).toString().padStart(3, "0");
    const rollNo = `${batchCode}${deptId}${className}${number}`;
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];

    return {
      id: `${batchId}-${deptId}-${className}-${number}`,
      name: `${first} ${last}`,
      rollNo,
    };
  });
};

const buildDataset = (): Dataset => {
  const dataset: Dataset = {};

  BATCHES.forEach((batch) => {
    dataset[batch.id] = DEPARTMENTS.map((dept) => {
      const classes: Class[] = CLASS_NAMES.map((className) => ({
        id: `${dept.id}-${className}`,
        name: className,
        students: buildStudents(batch.id, dept.id, className),
      }));

      return {
        id: dept.id,
        name: dept.name,
        classes,
      };
    });
  });

  return dataset;
};

const DATASET = buildDataset();

const getDepartmentsForBatch = (batchId: string): Department[] => {
  return DATASET[batchId] || [];
};

export const getBatches = (): Batch[] => {
  return BATCHES;
};

export const getDepartments = (batchId: string): Department[] => {
  return getDepartmentsForBatch(batchId);
};

export const getClassesByDepartment = (batchId: string, departmentId: string): Class[] => {
  const departments = getDepartmentsForBatch(batchId);
  const department = departments.find((dept) => dept.id === departmentId);
  return department?.classes || [];
};

export const getStudentsByClass = (batchId: string, departmentId: string, classId: string): Student[] => {
  const classes = getClassesByDepartment(batchId, departmentId);
  const classData = classes.find((cls) => cls.id === classId);
  return classData?.students || [];
};

export const getSubjectsByDepartment = (departmentId: string): Subject[] => {
  return SUBJECTS_BY_DEPT[departmentId] || [];
};
