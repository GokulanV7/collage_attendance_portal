"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AttendanceSubmission } from "@/types";
import { safeSessionStorage } from "@/utils/safeSessionStorage";

interface AttendanceContextType {
  submissions: AttendanceSubmission[];
  addSubmission: (submission: AttendanceSubmission) => void;
  getSubmissions: () => AttendanceSubmission[];
  clearSubmissions: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([]);
  const storageKey = "attendanceSubmissions";

  useEffect(() => {
    const stored = safeSessionStorage.getJSON<AttendanceSubmission[]>(
      storageKey,
      []
    );
    if (stored && Array.isArray(stored)) {
      setSubmissions(stored);
    }
  }, []);

  const addSubmission = (submission: AttendanceSubmission) => {
    setSubmissions((prev) => {
      const next = [...prev, submission];
      safeSessionStorage.setJSON(storageKey, next);
      return next;
    });
  };

  const getSubmissions = () => {
    return submissions;
  };

  const clearSubmissions = () => {
    setSubmissions([]);
    safeSessionStorage.removeItem(storageKey);
  };

  return (
    <AttendanceContext.Provider
      value={{ submissions, addSubmission, getSubmissions, clearSubmissions }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
};
