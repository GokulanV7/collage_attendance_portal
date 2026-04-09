"use client";

import { useState, useCallback, useEffect } from "react";
import { Semester } from "@/types";
import * as subjectStorage from "@/utils/subjectStorage";

interface UseSemestersReturn {
  semesters: Semester[];
  loading: boolean;
  error: string | null;
  loadSemesters: (batchId: string, departmentId: string) => void;
  addSemester: (semester: Omit<Semester, "id" | "createdAt" | "updatedAt">) => Semester | null;
  editSemester: (semesterId: string, updates: Partial<Omit<Semester, "id">>, batchId: string, departmentId: string) => Semester | null;
  removeSemester: (semesterId: string, batchId: string, departmentId: string) => boolean;
  getSemester: (semesterId: string, batchId: string, departmentId: string) => Semester | null;
  isValidSemester: (semester: any) => boolean;
  clearError: () => void;
}

/**
 * Custom hook for managing semesters
 */
export const useSemesters = (initialBatchId?: string, initialDeptId?: string): UseSemestersReturn => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSemesters = useCallback((batchId: string, departmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const loaded = subjectStorage.getSemesters(batchId, departmentId);
      setSemesters(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load semesters");
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSemester = useCallback(
    (semester: Omit<Semester, "id" | "createdAt" | "updatedAt">) => {
      try {
        setError(null);
        const newSemester = subjectStorage.saveSemester(semester);
        setSemesters((prev) => [...prev, newSemester]);
        return newSemester;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add semester";
        setError(msg);
        return null;
      }
    },
    []
  );

  const editSemester = useCallback(
    (
      semesterId: string,
      updates: Partial<Omit<Semester, "id">>,
      batchId: string,
      departmentId: string
    ) => {
      try {
        setError(null);
        const updated = subjectStorage.updateSemester(semesterId, updates, batchId, departmentId);
        if (updated) {
          setSemesters((prev) =>
            prev.map((s) => (s.id === semesterId ? updated : s))
          );
        } else {
          setError("Failed to update semester");
        }
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update semester";
        setError(msg);
        return null;
      }
    },
    []
  );

  const removeSemester = useCallback(
    (semesterId: string, batchId: string, departmentId: string) => {
      try {
        setError(null);
        const success = subjectStorage.deleteSemester(semesterId, batchId, departmentId);
        if (success) {
          setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
        } else {
          setError("Failed to delete semester");
        }
        return success;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete semester";
        setError(msg);
        return false;
      }
    },
    []
  );

  const getSemester = useCallback(
    (semesterId: string, batchId: string, departmentId: string) => {
      return subjectStorage.getSemesterById(semesterId, batchId, departmentId);
    },
    []
  );

  const isValidSemester = useCallback((semester: any): boolean => {
    if (!semester) return false;
    if (!semester.name || semester.name.trim().length === 0) return false;
    if (!semester.batchId) return false;
    if (!semester.departmentId) return false;
    if (semester.year < 1 || semester.year > 4) return false;
    if (!semester.startDate || !semester.endDate) return false;
    if (!subjectStorage.validateSemesterDates(semester.startDate, semester.endDate)) {
      return false;
    }
    return true;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load semesters on mount if batch and dept IDs are provided
  useEffect(() => {
    if (initialBatchId && initialDeptId) {
      loadSemesters(initialBatchId, initialDeptId);
    }
  }, [initialBatchId, initialDeptId, loadSemesters]);

  return {
    semesters,
    loading,
    error,
    loadSemesters,
    addSemester,
    editSemester,
    removeSemester,
    getSemester,
    isValidSemester,
    clearError,
  };
};
