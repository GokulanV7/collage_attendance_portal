import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "" }) => {
  return (
    <div
      className={`ui-panel rounded-3xl p-5 text-neutral-secondary transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(14,140,58,0.17)] sm:p-7 ${className}`}
    >
      {title && (
        <h2
          className="mb-4 text-2xl font-bold tracking-tight text-neutral-primary"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};
