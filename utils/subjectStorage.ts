import { Semester, ManagedSubject, ClassSubjectMapping, Period } from "@/types";

// ===== Helper Functions =====

/**
 * Generate a unique ID (simple implementation)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get storage key for semesters based on batch and department
 */
const getSemesterStorageKey = (batchId: string, departmentId: string): string => {
  return `semesters_${batchId}_${departmentId}`;
};

/**
 * Get storage key for subjects based on semester
 */
const getSubjectStorageKey = (semesterId: string): string => {
  return `subjects_${semesterId}`;
};

/**
 * Get storage key for class-subject mappings
 */
const getClassMappingStorageKey = (semesterId: string): string => {
  return `classMappings_${semesterId}`;
};

// ===== Semester Operations =====

/**
 * Get all semesters for a specific batch and department
 */
export const getSemesters = (batchId: string, departmentId: string): Semester[] => {
  try {
    const stored = localStorage.getItem(getSemesterStorageKey(batchId, departmentId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting semesters:", error);
    return [];
  }
};

/**
 * Get a specific semester by ID
 */
export const getSemesterById = (semesterId: string, batchId: string, departmentId: string): Semester | null => {
  try {
    const semesters = getSemesters(batchId, departmentId);
    return semesters.find((s) => s.id === semesterId) || null;
  } catch (error) {
    console.error("Error getting semester:", error);
    return null;
  }
};

/**
 * Save a new semester
 */
export const saveSemester = (semester: Omit<Semester, "id" | "createdAt" | "updatedAt">): Semester => {
  try {
    const newSemester: Semester = {
      ...semester,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const semesters = getSemesters(semester.batchId, semester.departmentId);
    semesters.push(newSemester);

    localStorage.setItem(
      getSemesterStorageKey(semester.batchId, semester.departmentId),
      JSON.stringify(semesters)
    );

    return newSemester;
  } catch (error) {
    console.error("Error saving semester:", error);
    throw new Error("Failed to save semester");
  }
};

/**
 * Update an existing semester
 */
export const updateSemester = (
  semesterId: string,
  updates: Partial<Omit<Semester, "id">>,
  batchId: string,
  departmentId: string
): Semester | null => {
  try {
    const semesters = getSemesters(batchId, departmentId);
    const index = semesters.findIndex((s) => s.id === semesterId);

    if (index === -1) {
      throw new Error("Semester not found");
    }

    semesters[index] = {
      ...semesters[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(getSemesterStorageKey(batchId, departmentId), JSON.stringify(semesters));
    return semesters[index];
  } catch (error) {
    console.error("Error updating semester:", error);
    return null;
  }
};

/**
 * Delete a semester and all its subjects
 */
export const deleteSemester = (semesterId: string, batchId: string, departmentId: string): boolean => {
  try {
    // Delete semester
    const semesters = getSemesters(batchId, departmentId);
    const filtered = semesters.filter((s) => s.id !== semesterId);
    localStorage.setItem(getSemesterStorageKey(batchId, departmentId), JSON.stringify(filtered));

    // Delete associated subjects
    localStorage.removeItem(getSubjectStorageKey(semesterId));
    localStorage.removeItem(getClassMappingStorageKey(semesterId));

    return true;
  } catch (error) {
    console.error("Error deleting semester:", error);
    return false;
  }
};

// ===== Subject Operations =====

/**
 * Get all subjects for a semester
 */
export const getSubjects = (semesterId: string): ManagedSubject[] => {
  try {
    const stored = localStorage.getItem(getSubjectStorageKey(semesterId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting subjects:", error);
    return [];
  }
};

/**
 * Get a specific subject by ID
 */
export const getSubjectById = (subjectId: string, semesterId: string): ManagedSubject | null => {
  try {
    const subjects = getSubjects(semesterId);
    return subjects.find((s) => s.id === subjectId) || null;
  } catch (error) {
    console.error("Error getting subject:", error);
    return null;
  }
};

/**
 * Check if a subject code is unique within a semester
 */
export const isSubjectCodeUnique = (code: string, semesterId: string, excludeSubjectId?: string): boolean => {
  try {
    const subjects = getSubjects(semesterId);
    return !subjects.some(
      (s) => s.code.toUpperCase() === code.toUpperCase() && s.id !== excludeSubjectId
    );
  } catch (error) {
    console.error("Error checking unique code:", error);
    return false;
  }
};

/**
 * Save a new subject
 */
export const saveSubject = (subject: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">): ManagedSubject | null => {
  try {
    // Check unique code
    if (!isSubjectCodeUnique(subject.code, subject.semesterId)) {
      throw new Error("Subject code must be unique per semester");
    }

    const newSubject: ManagedSubject = {
      ...subject,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const subjects = getSubjects(subject.semesterId);
    subjects.push(newSubject);

    localStorage.setItem(getSubjectStorageKey(subject.semesterId), JSON.stringify(subjects));

    return newSubject;
  } catch (error) {
    console.error("Error saving subject:", error);
    return null;
  }
};

/**
 * Update an existing subject
 */
export const updateSubject = (
  subjectId: string,
  updates: Partial<Omit<ManagedSubject, "id">>,
  semesterId: string
): ManagedSubject | null => {
  try {
    // If code is being updated, check uniqueness
    if (updates.code) {
      if (!isSubjectCodeUnique(updates.code, semesterId, subjectId)) {
        throw new Error("Subject code must be unique per semester");
      }
    }

    const subjects = getSubjects(semesterId);
    const index = subjects.findIndex((s) => s.id === subjectId);

    if (index === -1) {
      throw new Error("Subject not found");
    }

    subjects[index] = {
      ...subjects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(getSubjectStorageKey(semesterId), JSON.stringify(subjects));
    return subjects[index];
  } catch (error) {
    console.error("Error updating subject:", error);
    return null;
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = (subjectId: string, semesterId: string): boolean => {
  try {
    const subjects = getSubjects(semesterId);
    const filtered = subjects.filter((s) => s.id !== subjectId);
    localStorage.setItem(getSubjectStorageKey(semesterId), JSON.stringify(filtered));

    // Delete associated class mappings
    const mappings = getClassSubjectMappings(semesterId);
    const filteredMappings = mappings.filter((m) => m.subjectId !== subjectId);
    localStorage.setItem(getClassMappingStorageKey(semesterId), JSON.stringify(filteredMappings));

    return true;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
};

/**
 * Get subjects by class
 */
export const getSubjectsByClass = (classId: string, semesterId: string): ManagedSubject[] => {
  try {
    const mappings = getClassSubjectMappings(semesterId);
    const subjectIds = mappings
      .filter((m) => m.classId === classId && m.isActive)
      .map((m) => m.subjectId);

    const subjects = getSubjects(semesterId);
    return subjects.filter((s) => subjectIds.includes(s.id));
  } catch (error) {
    console.error("Error getting subjects by class:", error);
    return [];
  }
};

// ===== Class-Subject Mapping Operations =====

/**
 * Get all class-subject mappings for a semester
 */
export const getClassSubjectMappings = (semesterId: string): ClassSubjectMapping[] => {
  try {
    const stored = localStorage.getItem(getClassMappingStorageKey(semesterId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting class mappings:", error);
    return [];
  }
};

/**
 * Save class-subject mapping
 */
export const saveClassSubjectMapping = (
  mapping: Omit<ClassSubjectMapping, "id" | "createdAt" | "updatedAt">
): ClassSubjectMapping => {
  try {
    const newMapping: ClassSubjectMapping = {
      ...mapping,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mappings = getClassSubjectMappings(mapping.semesterId);
    mappings.push(newMapping);

    localStorage.setItem(getClassMappingStorageKey(mapping.semesterId), JSON.stringify(mappings));

    return newMapping;
  } catch (error) {
    console.error("Error saving class mapping:", error);
    throw new Error("Failed to save class mapping");
  }
};

/**
 * Update class-subject mapping
 */
export const updateClassSubjectMapping = (
  mappingId: string,
  updates: Partial<Omit<ClassSubjectMapping, "id">>,
  semesterId: string
): ClassSubjectMapping | null => {
  try {
    const mappings = getClassSubjectMappings(semesterId);
    const index = mappings.findIndex((m) => m.id === mappingId);

    if (index === -1) {
      throw new Error("Mapping not found");
    }

    mappings[index] = {
      ...mappings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(getClassMappingStorageKey(semesterId), JSON.stringify(mappings));
    return mappings[index];
  } catch (error) {
    console.error("Error updating class mapping:", error);
    return null;
  }
};

/**
 * Delete class-subject mapping
 */
export const deleteClassSubjectMapping = (mappingId: string, semesterId: string): boolean => {
  try {
    const mappings = getClassSubjectMappings(semesterId);
    const filtered = mappings.filter((m) => m.id !== mappingId);
    localStorage.setItem(getClassMappingStorageKey(semesterId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting class mapping:", error);
    return false;
  }
};

/**
 * Delete all mappings for a subject
 */
export const deleteSubjectMappings = (subjectId: string, semesterId: string): boolean => {
  try {
    const mappings = getClassSubjectMappings(semesterId);
    const filtered = mappings.filter((m) => m.subjectId !== subjectId);
    localStorage.setItem(getClassMappingStorageKey(semesterId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting subject mappings:", error);
    return false;
  }
};

// ===== Validation & Utility Functions =====

/**
 * Validate semester dates
 */
export const validateSemesterDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Validate subject credits (1-4)
 */
export const validateCredits = (credits: number): boolean => {
  return credits >= 1 && credits <= 4;
};

/**
 * Get summary statistics for a semester
 */
export const getSemesterSummary = (semesterId: string) => {
  try {
    const subjects = getSubjects(semesterId);
    const mappings = getClassSubjectMappings(semesterId);

    const activeSubjects = subjects.length;
    const totalClassAssignments = mappings.filter((m) => m.isActive).length;
    const uniqueClasses = new Set(mappings.map((m) => m.classId)).size;

    return {
      totalSubjects: activeSubjects,
      totalClassAssignments,
      uniqueClasses,
      totalCredits: subjects.reduce((acc, s) => acc + s.credits, 0),
    };
  } catch (error) {
    console.error("Error getting semester summary:", error);
    return {
      totalSubjects: 0,
      totalClassAssignments: 0,
      uniqueClasses: 0,
      totalCredits: 0,
    };
  }
};

/**
 * Clear all subject data for a semester (for testing/demo)
 */
export const clearSemesterData = (semesterId: string): boolean => {
  try {
    localStorage.removeItem(getSubjectStorageKey(semesterId));
    localStorage.removeItem(getClassMappingStorageKey(semesterId));
    return true;
  } catch (error) {
    console.error("Error clearing semester data:", error);
    return false;
  }
};

/**
 * Export semester subjects to CSV format (utility for future export feature)
 */
export const exportSemesterSubjectsAsCSV = (semesterId: string): string => {
  try {
    const subjects = getSubjects(semesterId);
    const headers = ["Code", "Name", "Credits", "Faculty", "Classes"];
    const rows = subjects.map((s) => [
      s.code,
      s.name,
      s.credits.toString(),
      s.faculty || "",
      s.classesAssigned.join(";"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  } catch (error) {
    console.error("Error exporting subjects:", error);
    return "";
  }
};
