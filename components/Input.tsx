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
  min?: number;
  max?: number;
  disabled?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = "text",
  min,
  max,
  disabled = false,
  onKeyPress,
})  => {
  const inputId = `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-secondary">
        {label}
        {required && <span className="text-status-danger ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        style={{ caretColor: appTheme.brand.secondary }}
        className={`ui-focus-ring w-full rounded-2xl border bg-brand-surface px-4 py-3 text-base text-neutral-primary placeholder:text-neutral-muted disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-status-danger text-status-danger" : "border-neutral-border"
        }`}
      />
      {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
    </div>
  );
};
