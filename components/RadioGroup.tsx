import React from "react";
import { AttendanceStatus } from "@/types";
import { appTheme } from "@/styles/theme";

interface RadioOption {
  value: AttendanceStatus;
  label: string;
}

interface RadioGroupProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
  options: RadioOption[];
}

const toneMap: Record<AttendanceStatus, { background: string; text: string; border: string }> = {
  Present: {
    background: appTheme.status.success,
    text: appTheme.brand.surface,
    border: appTheme.status.success,
  },
  Absent: {
    background: appTheme.status.danger,
    text: appTheme.brand.surface,
    border: appTheme.status.danger,
  },
  "On-Duty": {
    background: appTheme.status.info,
    text: appTheme.brand.surface,
    border: appTheme.status.info,
  },
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const isSelected = value === option.value;
        const tones = toneMap[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={isSelected ? tones : undefined}
            className={`px-4 py-2 font-medium text-sm rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary ${
              isSelected
                ? "shadow-sm"
                : "bg-pastel-blue text-neutral-secondary border-neutral-border hover:bg-brand-surface"
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
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "On-Duty", label: "On-Duty" },
];
