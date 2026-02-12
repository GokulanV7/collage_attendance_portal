import React from "react";
import { AttendanceStatus } from "@/types";

interface RadioOption {
  value: AttendanceStatus;
  label: string;
  color: string;
}

interface RadioGroupProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
  options: RadioOption[];
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 font-medium text-sm ${
              isSelected
                ? option.color
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export const attendanceOptions: RadioOption[] = [
  { value: "Present", label: "Present", color: "bg-green-600 text-white" },
  { value: "Absent", label: "Absent", color: "bg-red-600 text-white" },
  { value: "On-Duty", label: "On-Duty", color: "bg-blue-600 text-white" },
];
