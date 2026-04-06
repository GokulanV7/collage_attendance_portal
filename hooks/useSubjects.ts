"use client";

import { useState, useCallback, useEffect } from "react";
import { ManagedSubject } from "@/types";
import * as subjectStorage from "@/utils/subjectStorage";

interface UseSubjectsReturn {
  subjects: ManagedSubject[];
  loading: boolean;
  error: string | null;
  loadSubjects: (semesterId: string) => void;
  addSubject: (subject: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">) => ManagedSubject | null;
  editSubject: (subjectId: string, updates: Partial<Omit<ManagedSubject, "id">>, semesterId: string) => ManagedSubject | null;
  removeSubject: (subjectId: string, semesterId: string) => boolean;
  getSubject: (subjectId: string, semesterId: string) => ManagedSubject | null;
  checkCodeUniqueness: (code: string, semesterId: string, excludeId?: string) => boolean;
  isValidSubject: (subject: any) => boolean;
  clearError: () => void;
}

/**
 * Custom hook for managing subjects
 */
export const useSubjects = (initialSemesterId?: string): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<ManagedSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback((semesterId: string) => {
    try {
      setLoading(true);
      setError(null);
      const loaded = subjectStorage.getSubjects(semesterId);
      setSubjects(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSubject = useCallback(
    (subject: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">) => {
      try {
        setError(null);
        const newSubject = subjectStorage.saveSubject(subject);
        if (newSubject) {
          setSubjects((prev) => [...prev, newSubject]);
        } else {
          setError("Subject code must be unique per semester");
        }
        return newSubject;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add subject";
        setError(msg);
        return null;
      }
    },
    []
  );

  const editSubject = useCallback(
    (subjectId: string, updates: Partial<Omit<ManagedSubject, "id">>, semesterId: string) => {
      try {
        setError(null);
        const updated = subjectStorage.updateSubject(subjectId, updates, semesterId);
        if (updated) {
          setSubjects((prev) =>
            prev.map((s) => (s.id === subjectId ? updated : s))
          );
        } else {
          setError("Failed to update subject");
        }
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update subject";
        setError(msg);
        return null;
      }
    },
    []
  );

  const removeSubject = useCallback(
    (subjectId: string, semesterId: string) => {
      try {
        setError(null);
        const success = subjectStorage.deleteSubject(subjectId, semesterId);
        if (success) {
          setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
        } else {
          setError("Failed to delete subject");
        }
        return success;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete subject";
        setError(msg);
        return false;
      }
    },
    []
  );

  const getSubject = useCallback(
    (subjectId: string, semesterId: string) => {
      return subjectStorage.getSubjectById(subjectId, semesterId);
    },
    []
  );

  const checkCodeUniqueness = useCallback(
    (code: string, semesterId: string, excludeId?: string) => {
      return subjectStorage.isSubjectCodeUnique(code, semesterId, excludeId);
    },
    []
  );

  const isValidSubject = useCallback((subject: any): boolean => {
    if (!subject) return false;
    if (!subject.code || subject.code.trim().length === 0) return false;
    if (!subject.name || subject.name.trim().length === 0) return false;
    if (!subject.semesterId) return false;
    if (subject.credits < 1 || subject.credits > 4) return false;
    if (!subject.classesAssigned || subject.classesAssigned.length === 0) return false;
    return true;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load subjects on mount if initialSemesterId is provided
  useEffect(() => {
    if (initialSemesterId) {
      loadSubjects(initialSemesterId);
    }
  }, [initialSemesterId, loadSubjects]);

  return {
    subjects,
    loading,
    error,
    loadSubjects,
    addSubject,
    editSubject,
    removeSubject,
    getSubject,
    checkCodeUniqueness,
    isValidSubject,
    clearError,
  };
};
