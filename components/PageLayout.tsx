import React from "react";
import Link from "next/link";
import Image from "next/image";

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
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const navButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-primary-soft px-4 py-2 text-sm font-semibold text-brand-secondary hover:border-brand-secondary hover:bg-white transition";

  return (
    <main className="min-h-screen bg-brand-background px-4 py-6 sm:px-8 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-brand-primary px-5 py-4">
            <Image
              src="/main%20logo.png"
              width={72}
              height={72}
              alt="Sri Shakthi Institute logo"
              className="h-16 w-16 object-contain"
              priority
            />
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-extrabold text-brand-secondary uppercase tracking-wide">
                Sri Shakthi Institute of Engineering and Technology
              </p>
              <p className="text-sm font-semibold text-brand-secondaryDark/80">
                An Autonomous Institution
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-brand-secondary/20 bg-brand-primary-soft px-5 py-4">
            {showBackButton && (
              <Link href={backHref} className={navButtonClass}>
                ← Back
              </Link>
            )}
            <Link href="/" className={navButtonClass}>
              ⌂ Home
            </Link>
            <span className="ml-auto text-sm font-semibold text-brand-secondaryDark">
              {formattedDate}
            </span>
          </div>
        </div>

        <header className="rounded-3xl bg-brand-secondary text-white px-6 py-8 text-center shadow-[0_18px_28px_rgba(14,140,58,0.25)]">
          <p className="text-xs uppercase tracking-[0.35em] font-semibold text-white/80">
            College Attendance Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base sm:text-lg text-white/90">
              {subtitle}
            </p>
          )}
        </header>

        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
};
