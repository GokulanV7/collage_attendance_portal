import React from "react";
import { appTheme } from "@/styles/theme";

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: "text" | "number" | "email";
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = "text",
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-secondary mb-2">
        {label}
        {required && <span className="text-status-danger ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{ caretColor: appTheme.brand.secondary }}
        className={`w-full px-4 py-3 border rounded-xl bg-brand-surface text-neutral-primary placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition ${
          error ? "border-status-danger text-status-danger" : "border-neutral-border"
        } text-base`}
      />
      {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
    </div>
  );
};
