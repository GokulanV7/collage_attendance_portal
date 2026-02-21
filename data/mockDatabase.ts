import { Batch, Department, Student, Class, Subject } from "@/types";

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

export const getSubjectsByDepartment = (departmentId: string): Subject[] => {
  return subjectsByDepartment[departmentId] || [];
};

// Backwards compatibility export for any legacy imports
export const departments = departmentsByBatch[batches[0].id];
