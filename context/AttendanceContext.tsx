"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AttendanceSubmission } from "@/types";
import { api } from "@/lib/api";

interface AttendanceContextType {
  submissions: AttendanceSubmission[];
  addSubmission: (submission: AttendanceSubmission) => void;
  getSubmissions: () => AttendanceSubmission[];
  clearSubmissions: () => void;
  refreshSubmissions: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([]);
  const storageKey = "attendanceSubmissions";

  const refreshSubmissions = useCallback(async () => {
    try {
      const response = await api.getAttendance();
      const records = Array.isArray(response?.data?.records)
        ? response.data.records
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (Array.isArray(records)) {
        setSubmissions(records as AttendanceSubmission[]);
        localStorage.setItem(storageKey, JSON.stringify(records));
      }
    } catch (error) {
      console.error("Failed to fetch attendance submissions:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? (JSON.parse(stored) as AttendanceSubmission[]) : [];
      if (Array.isArray(parsed)) {
        setSubmissions(parsed);
      }
    } catch (error) {
      console.error("Failed to load attendance submissions:", error);
      setSubmissions([]);
    }

    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      try {
        const next = event.newValue
          ? (JSON.parse(event.newValue) as AttendanceSubmission[])
          : [];
        if (Array.isArray(next)) {
          setSubmissions(next);
        }
      } catch (error) {
        console.error("Failed to sync attendance submissions:", error);
      }
    };

    window.addEventListener("storage", onStorageChange);
    void refreshSubmissions();
    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
  }, [refreshSubmissions]);

  const addSubmission = (submission: AttendanceSubmission) => {
    setSubmissions((prev) => {
      const next = [submission, ...prev.filter((item) => item.id !== submission.id)];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (error) {
        console.error("Failed to save attendance submissions:", error);
      }
      return next;
    });
  };

  const getSubmissions = () => {
    return submissions;
  };

  const clearSubmissions = () => {
    setSubmissions([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear attendance submissions:", error);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{ submissions, addSubmission, getSubmissions, clearSubmissions, refreshSubmissions }}
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
