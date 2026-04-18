'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdminStudent } from '@/types';
import { safeSessionStorage } from '@/utils/safeSessionStorage';
import { api } from '@/lib/api';

const STORAGE_KEY = 'admin_students';

interface StudentsContextType {
  students: AdminStudent[];
  loading: boolean;
  addStudent: (student: Omit<AdminStudent, 'id' | 'createdAt'>) => { success: boolean; message: string };
  bulkAddStudents: (students: Omit<AdminStudent, 'id' | 'createdAt'>[]) => { added: number; skipped: number; duplicates: string[] };
  updateStudent: (id: string, data: Partial<AdminStudent>) => boolean;
  deleteStudent: (id: string) => boolean;
  getStudentByRollNo: (rollNo: string) => AdminStudent | undefined;
  isRollNoUnique: (rollNo: string, excludeId?: string) => boolean;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};

interface StudentsProviderProps {
  children: ReactNode;
}

export const StudentsProvider: React.FC<StudentsProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = safeSessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStudents(parsed);
      } catch (e) {
        console.error('Failed to parse students from storage:', e);
      }
    }

    const hydrateFromApi = async () => {
      try {
        const response = await api.initData();
        const fetchedStudents = response?.data?.students;
        if (Array.isArray(fetchedStudents)) {
          setStudents(fetchedStudents);
        }
      } catch (e) {
        console.error('Failed to hydrate students from API:', e);
      } finally {
        setLoading(false);
      }
    };

    void hydrateFromApi();
  }, []);

  // Persist to sessionStorage whenever students change
  useEffect(() => {
    if (!loading) {
      safeSessionStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
  }, [students, loading]);

  const generateId = () => `STU-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const isRollNoUnique = useCallback((rollNo: string, excludeId?: string): boolean => {
    return !students.some(
      (s) => s.rollNo.toLowerCase() === rollNo.toLowerCase() && s.id !== excludeId
    );
  }, [students]);

  const getStudentByRollNo = useCallback((rollNo: string): AdminStudent | undefined => {
    return students.find((s) => s.rollNo.toLowerCase() === rollNo.toLowerCase());
  }, [students]);

  const addStudent = useCallback((student: Omit<AdminStudent, 'id' | 'createdAt'>): { success: boolean; message: string } => {
    if (!isRollNoUnique(student.rollNo)) {
      return { success: false, message: `Roll number ${student.rollNo} already exists` };
    }

    const newStudent: AdminStudent = {
      ...student,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);
    return { success: true, message: 'Student added successfully' };
  }, [isRollNoUnique]);

  const bulkAddStudents = useCallback((
    studentsToAdd: Omit<AdminStudent, 'id' | 'createdAt'>[]
  ): { added: number; skipped: number; duplicates: string[] } => {
    const duplicates: string[] = [];
    const validStudents: AdminStudent[] = [];
    const existingRollNos = new Set(students.map((s) => s.rollNo.toLowerCase()));
    const newRollNos = new Set<string>();

    studentsToAdd.forEach((student) => {
      const rollNoLower = student.rollNo.toLowerCase();
      
      if (existingRollNos.has(rollNoLower) || newRollNos.has(rollNoLower)) {
        duplicates.push(student.rollNo);
      } else {
        newRollNos.add(rollNoLower);
        validStudents.push({
          ...student,
          id: generateId(),
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (validStudents.length > 0) {
      setStudents((prev) => [...prev, ...validStudents]);
    }

    return {
      added: validStudents.length,
      skipped: duplicates.length,
      duplicates,
    };
  }, [students]);

  const updateStudent = useCallback((id: string, data: Partial<AdminStudent>): boolean => {
    // Check if roll number is being changed and is unique
    if (data.rollNo && !isRollNoUnique(data.rollNo, id)) {
      return false;
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    return true;
  }, [isRollNoUnique]);

  const deleteStudent = useCallback((id: string): boolean => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    return true;
  }, []);

  return (
    <StudentsContext.Provider
      value={{
        students,
        loading,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        getStudentByRollNo,
        isRollNoUnique,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
};
