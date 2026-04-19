import React from "react";
import { appTheme } from "@/styles/theme";

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  error,
}) => {
  const selectId = `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-neutral-secondary">
        {label}
        {required && <span className="text-status-danger ml-1">*</span>}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ caretColor: appTheme.brand.secondary }}
        className={`ui-focus-ring w-full rounded-2xl border bg-brand-surface px-4 py-3 text-base text-neutral-primary ${
          error ? "border-status-danger text-status-danger" : "border-neutral-border"
        }`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
    </div>
  );
};
