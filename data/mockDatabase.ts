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

const CSE_2023_2027_ROSTER: Record<string, string> = {
  A: `714023104001|ABINAYA K
714023104002|ABITHA M
714023104003|AJAY K
714023104004|AKILESHWARAN B
714023104005|AKSHATHA P
714023104006|ANANDHI A
714023104007|ANANTHU A S
714023104008|ANIRUDH T
714023104009|ANUNITHI K
714023104010|ARULRAJ JEBASINGH E
714023104011|ARUN A
714023104012|ARUN PRAVEEN A D
714023104013|ATHARSH VIKRAM N
714023104014|BHARATH KUMAR M S
714023104015|BHOOMASH A K
714023104016|DEVASREE T
714023104017|DHANUSH K
714023104018|DHARANI DARAN G
714023104019|DHARUN ADITHYA I
714023104020|DHINAKARAN C
714023104021|DHIVAKARAN R
714023104022|DINESH J
714023104023|DINESH KUMAR S
714023104024|DSHANTHINI R
714023104025|GEETHANJALI G P
714023104026|GOBI KRISHNAN M
714023104027|GOKULAN V
714023104028|GOKULL N T
714023104029|GOWTHAM V
714023104030|HAANI SYED N
714023104031|HAARHISH V.S
714023104032|HAMANTH A
714023104035|HARINI M
714023104036|HARISH S
714023104037|JACINTHA D
714023104038|JAYASURYA S
714023104039|JEEVASATHYA B
714023104040|JENISH S
714023104041|JHOTHI PRAKASH K
714023104042|KABIL R
714023104043|KAMALI S
714023104044|KARTHIK R
714023104045|KARTHIKHA SHREE S M
714023104046|KATHIR S
714023104047|KAVIN KRISHNA S
714023104048|KAVITHA K
714023104049|KAVIYA B
714023104050|KAVUSIK ROSAN B
714023104051|KAVYA G
714023104052|KIRAN P
714023104053|KISHORE N
714023104054|KISHORE P
714023104055|LEKHA P
714023104056|LUMIN YAGHAL S
714023104057|MAAJIDA A
714023104058|MADHUMITHA R
714023104059|MADHUSREE M
714023104060|MAHIRUNNISA S F`,
  B: `714023104061|MANISANKAR S
714023104062|MANOJ S
714023104063|MANOJ KUMAR P
714023104064|MATHESH K
714023104065|MEIDHARSHANSRI T
714023104066|MERCY ANGEL A
714023104067|MIDHUN KUMAR V
714023104068|MIRDULA R
714023104069|MOHAMED ARAFATH A
714023104070|MOHAMMED SIDHIK P
714023104071|MONIKA S
714023104072|MOWLIHA T J
714023104073|MRITHIP R
714023104074|MURUGAVEL V
714023104075|NANDHA KISHORE S
714023104076|NANDHAKUMAR K
714023104077|NANDHINI K
714023104078|NANDHINI K
714023104079|NAVEEN K
714023104080|NAVEEN KUMAR S
714023104081|NEETHISH S
714023104082|NIHAL N
714023104083|NIKITHA M
714023104084|OM PRAKASH P
714023104085|PERSIYA G
714023104086|PON ARBITHA B
714023104087|POOJA S
714023104088|PRABHA P
714023104089|PRANAVVEL A D
714023104090|PRASHANNAH A
714023104091|PRATHYUSH RAM G S
714023104092|PRAVEENA P
714023104093|PRIINCY V
714023104094|PRINCE KUMAR
714023104095|PUGAZHENTHI M
714023104096|RAMANATHAN P
714023104097|RENGANATHAN S
714023104098|RENUGA S
714023104099|RETIHA C
714023104100|RITHIKA G
714023104101|RITHIKA EVANGELINE R
714023104102|RITHUL JANARDHANAN
714023104103|ROHIT K
714023104104|ROHIT R
714023104105|ROHITH K
714023104106|SACHIN M
714023104107|SACHIN ANNADASAN
714023104108|SAHANA R
714023104109|SAILESH S
714023104110|SANDHYA R
714023104111|SANGEETHA M
714023104112|SANJANAA S
714023104113|SANJAY B
714023104114|SANJAY G
714023104115|SANJAY G
714023104116|SANJAY GANGADHARAM S
714023104117|SANJAY SRINIVAS T
714023104118|SANMATHI PRIYA K S
714023104119|SANTHIYA E
714023104120|SANTHIYA M`,
  C: `714023104121|SARAN B
714023104122|SARANYA S.M
714023104123|SARAVANA PRAKASH M
714023104124|SARAVANAN P
714023104125|SEEJA K
714023104126|SHABARIVASAN K
714023104127|SHREE VAISHNAVI KUMAR
714023104128|SHRINITHI N
714023104129|SIVA SWETHA S C K
714023104130|SNEHA B
714023104131|SRI NIDHI K
714023104132|SRIDHANISHTHA S
714023104133|SRIMATHI D
714023104134|SRIRAM G
714023104135|SRUTHI V
714023104136|SUBHASRI K T
714023104137|SUBIKSHA T V
714023104138|SUBIKSHAVANI N
714023104139|SUDHARSHAN R
714023104140|SUGANTHAN S
714023104141|SUJITH P
714023104142|SUJITHKUMAR S
714023104143|SUMITHKANTH G
714023104144|SWETHA M
714023104146|TARIKA S
714023104147|THAARANI M
714023104148|THALESHWARI J
714023104149|THAMARAI SELVAN S
714023104150|THARUN KARTHIK G
714023104151|THILAKPRIYAN R
714023104152|THIRUMURUGAN G
714023104153|THULASIRAM P
714023104154|UMADEVI C
714023104155|UVIN ARUL S
714023104156|VAISHALI B
714023104157|VARSITHA A
714023104158|VARUN S
714023104159|VEERAMADHUMITHA P
714023104160|VELMANI R
714023104161|VICKNESHWARAN K
714023104162|VIDHARSHANA D
714023104163|VIGNESH E
714023104164|VIGNESH KUMAR S
714023104165|VIGNESHWARAN R
714023104166|VIJAYA RANI V
714023104167|VIJAYA SRI KESAVAN
714023104168|VIKAS B
714023104169|VINOTHINI S
714023104170|VISHAL K
714023104171|VISHNU PRASAD J
714023104172|VISHNU PRASATH P
714023104173|VISHNU VARDHAN A
714023104174|VISWANATH N
714023104175|YASHWANT K
714023104176|YAZHINI R
714023104178|YESWANTH S
714023104179|YUVAPRASATH N
714023104501|THARANI K`,
};

const parseFixedRoster = (block: string, batchId: string, deptId: string, className: string): Student[] => {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rollNo, ...nameParts] = line.split("|");
      const name = nameParts.join("|").trim();
      return {
        id: rollNo,
        name,
        rollNo,
      } satisfies Student;
    });
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

const getStudentsForClass = (batchId: string, deptId: string, className: string): Student[] => {
  if (batchId === "2023-2027" && deptId === "CSE" && CSE_2023_2027_ROSTER[className]) {
    return parseFixedRoster(CSE_2023_2027_ROSTER[className], batchId, deptId, className);
  }

  return buildStudents(batchId, deptId, className);
};

const buildDataset = (): Dataset => {
  const dataset: Dataset = {};

  BATCHES.forEach((batch) => {
    dataset[batch.id] = DEPARTMENTS.map((dept) => {
      const classes: Class[] = CLASS_NAMES.map((className) => ({
        id: `${dept.id}-${className}`,
        name: className,
        students: getStudentsForClass(batch.id, dept.id, className),
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
