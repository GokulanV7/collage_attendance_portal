import React from "react";
import { appTheme } from "@/styles/theme";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  className = "",
}) => {
  const baseStyles =
    "px-6 py-3 rounded-full border-2 font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-base transition-all duration-200";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "focus-visible:ring-brand-secondary",
    secondary: "focus-visible:ring-brand-secondary",
    outline: "focus-visible:ring-brand-secondary",
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: appTheme.brand.secondary,
      color: appTheme.brand.surface,
      borderColor: appTheme.brand.secondary,
    },
    secondary: {
      backgroundColor: appTheme.brand.primarySoft,
      color: appTheme.brand.secondary,
      borderColor: appTheme.brand.secondary,
    },
    outline: {
      backgroundColor: appTheme.brand.surface,
      color: appTheme.brand.secondary,
      borderColor: appTheme.brand.secondary,
    },
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variantStyles[variant]}
      className={`${baseStyles} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};
