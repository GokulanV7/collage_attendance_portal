import React from "react";
import Link from "next/link";
import { appTheme } from "@/styles/theme";

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
    <main className="min-h-screen bg-brand-primary px-4 py-6 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header
          className="rounded-3xl hero-surface p-6 sm:p-8 text-center border border-brand-primary/40 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          style={{ color: appTheme.brand.secondary }}
        >
          {showBackButton && (
            <div className="mb-4 text-left">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:text-brand-secondaryDark"
              >
                ← Back
              </Link>
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.4em] font-semibold text-brand-secondary/80">
            College Attendance Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3" style={{ color: appTheme.brand.secondary }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base sm:text-lg text-brand-secondary/80">
              {subtitle}
            </p>
          )}
        </header>

        {/* Content */}
        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
};
