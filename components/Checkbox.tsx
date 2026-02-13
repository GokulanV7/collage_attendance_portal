import React from "react";
import { appTheme } from "@/styles/theme";

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
          style={{ accentColor: appTheme.brand.secondary }}
          className="w-5 h-5 text-brand-secondary border-neutral-border focus:outline-none cursor-pointer rounded"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-neutral-primary">
          {label}
        </p>
        {description && (
          <p className="text-sm text-neutral-muted mt-1">{description}</p>
        )}
      </div>
    </label>
  );
};
