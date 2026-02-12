import React from "react";
import Link from "next/link";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backHref = "/",
}) => {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {showBackButton && (
            <div className="mb-4">
              <Link
                href={backHref}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back
              </Link>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>

        {/* Content */}
        {children}
      </div>
    </main>
  );
};
