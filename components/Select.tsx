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
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-secondary mb-2">
        {label}
        {required && <span className="text-status-danger ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ caretColor: appTheme.brand.secondary }}
        className={`w-full px-4 py-3 border rounded-xl bg-brand-surface text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary ${
          error ? "border-status-danger text-status-danger" : "border-neutral-border"
        } text-base`}
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
