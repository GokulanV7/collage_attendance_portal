import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-white shadow-sm p-6 border border-gray-200 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
};
