import { Batch, Department, Student, Class } from "@/types";

export const batches: Batch[] = [
  { id: "2021-2025", name: "2021–2025" },
  { id: "2022-2026", name: "2022–2026" },
  { id: "2023-2027", name: "2023–2027" },
];

// Sample students for different departments and classes
const cseStudentsA: Student[] = [
  { id: "CS23A01", name: "Arun Kumar", rollNo: "23CSE001" },
  { id: "CS23A02", name: "Priya Sharma", rollNo: "23CSE002" },
  { id: "CS23A03", name: "Ravi Patel", rollNo: "23CSE003" },
  { id: "CS23A04", name: "Sneha Reddy", rollNo: "23CSE004" },
  { id: "CS23A05", name: "Karthik Krishnan", rollNo: "23CSE005" },
  { id: "CS23A06", name: "Divya Menon", rollNo: "23CSE006" },
  { id: "CS23A07", name: "Vijay Singh", rollNo: "23CSE007" },
  { id: "CS23A08", name: "Lakshmi Iyer", rollNo: "23CSE008" },
  { id: "CS23A09", name: "Aditya Verma", rollNo: "23CSE009" },
  { id: "CS23A10", name: "Meera Nair", rollNo: "23CSE010" },
];

const cseStudentsB: Student[] = [
  { id: "CS23B01", name: "Suresh Babu", rollNo: "23CSE011" },
  { id: "CS23B02", name: "Anjali Desai", rollNo: "23CSE012" },
  { id: "CS23B03", name: "Rahul Gupta", rollNo: "23CSE013" },
  { id: "CS23B04", name: "Pooja Joshi", rollNo: "23CSE014" },
  { id: "CS23B05", name: "Manoj Kumar", rollNo: "23CSE015" },
  { id: "CS23B06", name: "Nithya Rao", rollNo: "23CSE016" },
  { id: "CS23B07", name: "Arjun Pillai", rollNo: "23CSE017" },
  { id: "CS23B08", name: "Kavya Shetty", rollNo: "23CSE018" },
];

const cseStudentsC: Student[] = [
  { id: "CS23C01", name: "Naveen Kumar", rollNo: "23CSE019" },
  { id: "CS23C02", name: "Swathi Bhat", rollNo: "23CSE020" },
  { id: "CS23C03", name: "Harish Reddy", rollNo: "23CSE021" },
  { id: "CS23C04", name: "Deepika Iyer", rollNo: "23CSE022" },
  { id: "CS23C05", name: "Rohan Das", rollNo: "23CSE023" },
  { id: "CS23C06", name: "Ananya Singh", rollNo: "23CSE024" },
];

const itStudentsA: Student[] = [
  { id: "IT23A01", name: "Prakash Reddy", rollNo: "23IT001" },
  { id: "IT23A02", name: "Sanjana Murthy", rollNo: "23IT002" },
  { id: "IT23A03", name: "Ganesh Rao", rollNo: "23IT003" },
  { id: "IT23A04", name: "Bhavana Shetty", rollNo: "23IT004" },
  { id: "IT23A05", name: "Ramesh Kumar", rollNo: "23IT005" },
  { id: "IT23A06", name: "Shruti Nair", rollNo: "23IT006" },
  { id: "IT23A07", name: "Varun Patel", rollNo: "23IT007" },
  { id: "IT23A08", name: "Madhavi Reddy", rollNo: "23IT008" },
];

const itStudentsB: Student[] = [
  { id: "IT23B01", name: "Santhosh Kumar", rollNo: "23IT009" },
  { id: "IT23B02", name: "Anusha Iyer", rollNo: "23IT010" },
  { id: "IT23B03", name: "Krishna Murthy", rollNo: "23IT011" },
  { id: "IT23B04", name: "Preeti Sharma", rollNo: "23IT012" },
  { id: "IT23B05", name: "Mohan Rao", rollNo: "23IT013" },
  { id: "IT23B06", name: "Vasudha Menon", rollNo: "23IT014" },
];

const eceStudentsA: Student[] = [
  { id: "EC23A01", name: "Sunil Kumar", rollNo: "23ECE001" },
  { id: "EC23A02", name: "Rekha Reddy", rollNo: "23ECE002" },
  { id: "EC23A03", name: "Akash Singh", rollNo: "23ECE003" },
  { id: "EC23A04", name: "Geeta Rao", rollNo: "23ECE004" },
  { id: "EC23A05", name: "Vinay Kumar", rollNo: "23ECE005" },
  { id: "EC23A06", name: "Sowmya Nair", rollNo: "23ECE006" },
];

const eceStudentsB: Student[] = [
  { id: "EC23B01", name: "Ramesh Babu", rollNo: "23ECE007" },
  { id: "EC23B02", name: "Shilpa Rao", rollNo: "23ECE008" },
  { id: "EC23B03", name: "Naveen Kumar", rollNo: "23ECE009" },
  { id: "EC23B04", name: "Ashwini Reddy", rollNo: "23ECE010" },
];

const mechStudentsA: Student[] = [
  { id: "ME23A01", name: "Rajesh Kumar", rollNo: "23ME001" },
  { id: "ME23A02", name: "Deepa Shetty", rollNo: "23ME002" },
  { id: "ME23A03", name: "Kishore Reddy", rollNo: "23ME003" },
  { id: "ME23A04", name: "Uma Mahesh", rollNo: "23ME004" },
  { id: "ME23A05", name: "Srinivas Rao", rollNo: "23ME005" },
];

const mechStudentsB: Student[] = [
  { id: "ME23B01", name: "Lokesh Kumar", rollNo: "23ME006" },
  { id: "ME23B02", name: "Pavitra Reddy", rollNo: "23ME007" },
  { id: "ME23B03", name: "Chandrasekhar", rollNo: "23ME008" },
];

// Classes structure
const cseClasses: Class[] = [
  { id: "CSE-A", name: "A", students: cseStudentsA },
  { id: "CSE-B", name: "B", students: cseStudentsB },
  { id: "CSE-C", name: "C", students: cseStudentsC },
];

const itClasses: Class[] = [
  { id: "IT-A", name: "A", students: itStudentsA },
  { id: "IT-B", name: "B", students: itStudentsB },
];

const eceClasses: Class[] = [
  { id: "ECE-A", name: "A", students: eceStudentsA },
  { id: "ECE-B", name: "B", students: eceStudentsB },
];

const mechClasses: Class[] = [
  { id: "ME-A", name: "A", students: mechStudentsA },
  { id: "ME-B", name: "B", students: mechStudentsB },
];

// Departments structure
export const departments: Department[] = [
  {
    id: "CSE",
    name: "Computer Science Engineering",
    classes: cseClasses,
  },
  {
    id: "IT",
    name: "Information Technology",
    classes: itClasses,
  },
  {
    id: "ECE",
    name: "Electronics and Communication Engineering",
    classes: eceClasses,
  },
  {
    id: "ME",
    name: "Mechanical Engineering",
    classes: mechClasses,
  },
];

// Helper functions to fetch data
export const getBatches = (): Batch[] => {
  return batches;
};

export const getDepartments = (): Department[] => {
  return departments;
};

export const getClassesByDepartment = (departmentId: string): Class[] => {
  const department = departments.find((d) => d.id === departmentId);
  return department?.classes || [];
};

export const getStudentsByClass = (
  departmentId: string,
  classId: string
): Student[] => {
  const department = departments.find((d) => d.id === departmentId);
  const classData = department?.classes.find((c) => c.id === classId);
  return classData?.students || [];
};
