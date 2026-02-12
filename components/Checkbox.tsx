import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  description,
}) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-primary-600 border-gray-300 focus:outline-none cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">
          {label}
        </p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </label>
  );
};
