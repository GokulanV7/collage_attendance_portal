"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AttendanceSubmission } from "@/types";

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

  const addSubmission = (submission: AttendanceSubmission) => {
    setSubmissions((prev) => [...prev, submission]);
  };

  const getSubmissions = () => {
    return submissions;
  };

  const clearSubmissions = () => {
    setSubmissions([]);
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
