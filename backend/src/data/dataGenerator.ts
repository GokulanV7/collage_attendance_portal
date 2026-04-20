import { Student, Staff, Admin } from "../types";

export const SUBJECTS_BY_DEPARTMENT: Record<string, Array<{ code: string; name: string }>> = {
  CSE: [
    { code: "CS301", name: "Operating Systems" },
    { code: "CS302", name: "Database Management Systems" },
    { code: "CS303", name: "Computer Networks" },
    { code: "CS304", name: "Software Engineering" },
  ],
  IT: [
    { code: "IT301", name: "Web Technologies" },
    { code: "IT302", name: "Cloud Computing" },
    { code: "IT303", name: "Information Security" },
    { code: "IT304", name: "Design and Analysis of Algorithms" },
  ],
  ECE: [
    { code: "EC301", name: "Digital Signal Processing" },
    { code: "EC302", name: "VLSI Design" },
    { code: "EC303", name: "Digital Communication" },
    { code: "EC304", name: "Microelectronics" },
  ],
  ME: [
    { code: "ME301", name: "Thermal Engineering" },
    { code: "ME302", name: "Machine Design" },
    { code: "ME303", name: "Fluid Mechanics" },
    { code: "ME304", name: "Industrial Management" },
  ],
  AIML: [
    { code: "AI301", name: "Machine Learning" },
    { code: "AI302", name: "Deep Learning" },
    { code: "AI303", name: "Natural Language Processing" },
    { code: "AI304", name: "Computer Vision" },
  ],
};

const firstNames = [
  "Arun",
  "Priya",
  "Raj",
  "Sofia",
  "Rohit",
  "Isha",
  "Arjun",
  "Neha",
  "Vikram",
  "Ananya",
  "Sanjay",
  "Deepa",
  "Ravi",
  "Pooja",
  "Ashok",
  "Shreya",
  "Nikhil",
  "Swati",
  "Gaurav",
  "Nidhi",
];

const lastNames = [
  "Kumar",
  "Sharma",
  "Patel",
  "Singh",
  "Gupta",
  "Nair",
  "Rao",
  "Iyer",
  "Khan",
  "Verma",
  "Mishra",
  "Chopra",
  "Desai",
  "Reddy",
  "Bhat",
  "Pillai",
];

export const dataGenerator = {
  generateStudents: (): Student[] => {
    const students: Student[] = [];
    const years = ["2021-2025", "2022-2026", "2023-2027"];
    const depts = ["CSE", "IT", "ECE", "ME", "AIML"];
    const classes = ["A", "B", "C"];
    const sections = ["1", "2"];

    let studentCounter = 1;

    for (const year of years) {
      for (const dept of depts) {
        for (const cls of classes) {
          for (const section of sections) {
            // 20 students per section
            for (let i = 1; i <= 20; i++) {
              const yearPrefix = year.substring(2, 4);
              const rollNo = `${yearPrefix}${dept}${studentCounter.toString().padStart(3, "0")}`;
              const firstName =
                firstNames[Math.floor(Math.random() * firstNames.length)];
              const lastName =
                lastNames[Math.floor(Math.random() * lastNames.length)];

              students.push({
                id: `STU${studentCounter}`,
                rollNo,
                name: `${firstName} ${lastName}`,
                year,
                department: dept,
                class: cls,
                section,
                email: `${rollNo.toLowerCase()}@college.edu`,
                phone: `98${String(studentCounter).padStart(8, "0")}`,
                createdAt: new Date().toISOString(),
              });

              studentCounter++;
            }
          }
        }
      }
    }

    return students;
  },

  generateStaff: (): Staff[] => {
    return [
      {
        id: "ST001",
        name: "Dr. Rajesh Kumar",
        email: "rajesh@college.edu",
        department: "CSE",
        staffId: "ST001",
        password: "password123",
        role: "staff",
      },
      {
        id: "ST002",
        name: "Prof. Priya Sharma",
        email: "priya@college.edu",
        department: "CSE",
        staffId: "ST002",
        password: "password123",
        role: "staff",
      },
      {
        id: "ST003",
        name: "Dr. Arun Menon",
        email: "arun@college.edu",
        department: "IT",
        staffId: "ST003",
        password: "password123",
        role: "staff",
      },
      {
        id: "ST004",
        name: "Prof. Sneha Patel",
        email: "sneha@college.edu",
        department: "ECE",
        staffId: "ST004",
        password: "password123",
        role: "staff",
      },
      {
        id: "ST005",
        name: "Dr. Akshay Singh",
        email: "akshay@college.edu",
        department: "ME",
        staffId: "ST005",
        password: "password123",
        role: "staff",
      },
      {
        id: "ST006",
        name: "Prof. Harini Raman",
        email: "harini@college.edu",
        department: "AIML",
        staffId: "ST006",
        password: "password123",
        role: "staff",
      },
    ];
  },

  generateAdmins: (): Admin[] => {
    return [
      {
        id: "ADMIN001",
        username: "admin",
        password: "admin123",
        email: "admin@college.edu",
        role: "admin",
      },
    ];
  },
};

// Export all mock data - This runs once on server start
export const MOCK_DATABASE = {
  students: dataGenerator.generateStudents(),
  staff: dataGenerator.generateStaff(),
  admins: dataGenerator.generateAdmins(),
  attendance: [] as any[],
};
