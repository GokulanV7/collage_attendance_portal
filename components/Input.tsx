import React from "react";

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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border focus:outline-none focus:border-primary-500 ${
          error ? "border-red-500" : "border-gray-300"
        } text-base`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
