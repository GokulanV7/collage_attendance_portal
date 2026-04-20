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
    <main className="min-h-screen px-3 py-4 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-7">
        <Navbar />

        {(title || subtitle) && (
          <div className="ui-panel rounded-3xl px-5 py-5 sm:px-7 sm:py-6">
            {title && (
              <h1
                className="text-xl font-bold text-neutral-primary sm:text-3xl"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 max-w-3xl text-sm text-neutral-secondary sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <section className="space-y-6 sm:space-y-7">{children}</section>
      </div>
    </main>
  );
};
