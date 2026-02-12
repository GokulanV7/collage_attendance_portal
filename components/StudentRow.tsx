import React from "react";
import { Student } from "@/types";

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
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-slate-700">{student.name}</h3>
        <p className="font-mono text-xs text-slate-500">{student.rollNo}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggle(student.id, true)}
          className={`px-6 py-2 font-medium ${
            isPresent
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Present
        </button>
        <button
          type="button"
          onClick={() => onToggle(student.id, false)}
          className={`px-6 py-2 font-medium ${
            !isPresent
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Absent
        </button>
      </div>
    </div>
  );
};
