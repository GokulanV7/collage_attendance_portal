import { Batch, Department, Student, Class } from "@/types";

export const batches: Batch[] = [
  { id: "2021-2025", name: "2021–2025" },
  { id: "2022-2026", name: "2022–2026" },
  { id: "2023-2027", name: "2023–2027" },
];

const makeStudents = (
  names: string[],
  idPrefix: string,
  rollPrefix: string,
  startIndex = 1
): Student[] => {
  return names.map((name, idx) => {
    const num = startIndex + idx;
    const idNumber = num.toString().padStart(2, "0");
    const rollNumber = num.toString().padStart(3, "0");
    return {
      id: `${idPrefix}${idNumber}`,
      name,
      rollNo: `${rollPrefix}${rollNumber}`,
    };
  });
};

const departmentNameMap: Record<string, { a: string[]; b: string[]; label: string }> = {
  CSE: {
    label: "Computer Science Engineering",
    a: [
      "Aarav Sharma",
      "Priya Nair",
      "Ravi Patel",
      "Sneha Reddy",
      "Karthik Krishnan",
      "Divya Menon",
      "Vijay Singh",
      "Lakshmi Iyer",
      "Aditya Verma",
      "Meera Das",
    ],
    b: [
      "Suresh Babu",
      "Anjali Desai",
      "Rahul Gupta",
      "Pooja Joshi",
      "Manoj Kumar",
      "Nithya Rao",
      "Arjun Pillai",
      "Kavya Shetty",
      "Abhinav Sen",
      "Tara Kulkarni",
    ],
  },
  IT: {
    label: "Information Technology",
    a: [
      "Prakash Reddy",
      "Sanjana Murthy",
      "Ganesh Rao",
      "Bhavana Shetty",
      "Ramesh Kumar",
      "Shruti Jain",
      "Varun Patel",
      "Madhavi Reddy",
      "Ritika Sharma",
      "Naveen Iyer",
    ],
    b: [
      "Santhosh Kumar",
      "Anusha Iyer",
      "Krishna Murthy",
      "Preeti Sharma",
      "Mohan Rao",
      "Vasudha Menon",
      "Charan Bhat",
      "Nikita Singh",
      "Harsha Gowda",
      "Pavithra R",
    ],
  },
  ECE: {
    label: "Electronics and Communication Engineering",
    a: [
      "Sunil Kumar",
      "Rekha Reddy",
      "Akash Singh",
      "Geeta Rao",
      "Vinay Kumar",
      "Sowmya Nair",
      "Rajiv Arora",
      "Mansi Gupta",
      "Rohit Ahuja",
      "Niharika Bose",
    ],
    b: [
      "Ramesh Babu",
      "Shilpa Rao",
      "Naveen Kumar",
      "Ashwini Reddy",
      "Sahil Mehta",
      "Pallavi Iyer",
      "Dheeraj Singh",
      "Ishita Sen",
      "Jayant Kulkarni",
      "Tanvi Deshpande",
    ],
  },
  ME: {
    label: "Mechanical Engineering",
    a: [
      "Rajesh Kumar",
      "Deepa Shetty",
      "Kishore Reddy",
      "Uma Mahesh",
      "Srinivas Rao",
      "Anita Verma",
      "Gautam Singh",
      "Kiran Patil",
      "Neeraj Jain",
      "Pooja Kulkarni",
    ],
    b: [
      "Lokesh Kumar",
      "Pavitra Reddy",
      "Chandrasekhar",
      "Arvind Nair",
      "Megha Sharma",
      "Sridhar Babu",
      "Yash Mehta",
      "Devika Rao",
      "Anand Pillai",
      "Snehal Patil",
    ],
  },
  AIML: {
    label: "Artificial Intelligence & ML",
    a: [
      "Ishaan Malhotra",
      "Diya Srinivasan",
      "Kabir Mehta",
      "Ridhi Agarwal",
      "Samar Kulkarni",
      "Nidhi Narayanan",
      "Farhan Shaikh",
      "Pari Deshmukh",
      "Vivaan Rao",
      "Sara Pinto",
    ],
    b: [
      "Raghav Menon",
      "Avni Kapoor",
      "Kunal Sharma",
      "Myra Fernandes",
      "Aravind S",
      "Tanisha Bhat",
      "Dev Patel",
      "Keya Banerjee",
      "Ayaan Noor",
      "Sia Mathew",
    ],
  },
};

const buildDepartment = (
  deptId: string,
  batchCode: string
): Department => {
  const nameSet = departmentNameMap[deptId];
  const classA: Class = {
    id: `${deptId}-A`,
    name: "A",
    students: makeStudents(nameSet.a, `${deptId}${batchCode}A`, `${batchCode}${deptId}`),
  };

  const classB: Class = {
    id: `${deptId}-B`,
    name: "B",
    students: makeStudents(nameSet.b, `${deptId}${batchCode}B`, `${batchCode}${deptId}`, 11),
  };

  return {
    id: deptId,
    name: nameSet.label,
    classes: [classA, classB],
  };
};

const createBatchDepartments = (batchId: string): Department[] => {
  const batchCode = batchId.slice(2, 4); // e.g., "2023-2027" -> "23"
  return [
    buildDepartment("CSE", batchCode),
    buildDepartment("IT", batchCode),
    buildDepartment("ECE", batchCode),
    buildDepartment("ME", batchCode),
    buildDepartment("AIML", batchCode),
  ];
};

export const departmentsByBatch: Record<string, Department[]> = {
  "2021-2025": createBatchDepartments("2021-2025"),
  "2022-2026": createBatchDepartments("2022-2026"),
  "2023-2027": createBatchDepartments("2023-2027"),
};

export const getBatches = (): Batch[] => {
  return batches;
};

export const getDepartments = (batchId?: string): Department[] => {
  if (batchId && departmentsByBatch[batchId]) {
    return departmentsByBatch[batchId];
  }
  return departmentsByBatch[batches[0].id] || [];
};

export const getClassesByDepartment = (
  batchId: string,
  departmentId: string
): Class[] => {
  const departments = getDepartments(batchId);
  const department = departments.find((d) => d.id === departmentId);
  return department?.classes || [];
};

export const getStudentsByClass = (
  batchId: string,
  departmentId: string,
  classId: string
): Student[] => {
  const classes = getClassesByDepartment(batchId, departmentId);
  const classData = classes.find((c) => c.id === classId);
  return classData?.students || [];
};

// Backwards compatibility export for any legacy imports
export const departments = departmentsByBatch[batches[0].id];
