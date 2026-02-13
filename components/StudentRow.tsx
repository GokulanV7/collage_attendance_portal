import React from "react";
import { Student } from "@/types";
import { appTheme } from "@/styles/theme";

interface StudentRowProps {
  student: Student;
  isPresent: boolean;
  onToggle: (studentId: string, isPresent: boolean) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  isPresent,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-brand-surface border border-neutral-border rounded-2xl">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-neutral-primary">{student.name}</h3>
        <p className="font-mono text-xs text-neutral-muted">{student.rollNo}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggle(student.id, true)}
          style={
            isPresent
              ? {
                  backgroundColor: appTheme.status.success,
                  color: appTheme.brand.surface,
                  borderColor: appTheme.status.success,
                }
              : undefined
          }
          className={`px-6 py-2 font-medium rounded-full border-2 transition ${
            isPresent
              ? "shadow-sm"
              : "bg-pastel-mint text-neutral-secondary border-neutral-border hover:bg-brand-surface"
          }`}
        >
          Present
        </button>
        <button
          type="button"
          onClick={() => onToggle(student.id, false)}
          style={
            !isPresent
              ? {
                  backgroundColor: appTheme.status.danger,
                  color: appTheme.brand.surface,
                  borderColor: appTheme.status.danger,
                }
              : undefined
          }
          className={`px-6 py-2 font-medium rounded-full border-2 transition ${
            !isPresent
              ? "shadow-sm"
              : "bg-pastel-peach text-neutral-secondary border-neutral-border hover:bg-brand-surface"
          }`}
        >
          Absent
        </button>
      </div>
    </div>
  );
};
