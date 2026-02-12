import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
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
    "px-6 py-3 rounded-lg font-semibold tracking-wide focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700",
    outline:
      "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};
