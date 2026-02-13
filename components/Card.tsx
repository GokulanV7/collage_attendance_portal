import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "" }) => {
  return (
    <div
      className={`rounded-[28px] border border-brand-secondary/40 bg-white p-6 text-neutral-secondary shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(14,140,58,0.2)] ${className}`}
    >
      {title && (
        <h2 className="text-2xl font-bold tracking-tight text-neutral-primary mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};
