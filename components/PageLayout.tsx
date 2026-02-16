import React from "react";
import { Navbar } from "./Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <main className="min-h-screen bg-brand-background px-3 py-4 sm:px-8 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <Navbar />

        {/* Page Title Section */}
        {(title || subtitle) && (
          <div className="rounded-2xl border border-brand-secondary/20 bg-white shadow-sm px-4 sm:px-6 py-4">
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-secondary mt-1">{subtitle}</p>
            )}
          </div>
        )}

        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
};
