import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border-2 border-brand-secondary bg-[var(--color-surface)] p-6 text-neutral-secondary shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(46,125,50,0.2)] ${className}`}
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
