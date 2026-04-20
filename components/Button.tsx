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
    "ui-focus-ring inline-flex items-center justify-center px-6 py-3 rounded-2xl border font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed text-base transition-all duration-200 active:scale-[0.99]";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "shadow-[0_10px_24px_rgba(14,140,58,0.26)] hover:shadow-[0_14px_28px_rgba(14,140,58,0.3)] hover:-translate-y-0.5",
    secondary: "hover:-translate-y-0.5 hover:bg-brand-primary",
    outline: "hover:-translate-y-0.5 hover:bg-brand-primarySoft/60",
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: appTheme.brand.secondary,
      color: appTheme.brand.surface,
      borderColor: appTheme.brand.secondary,
    },
    secondary: {
      backgroundColor: appTheme.brand.primary,
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
