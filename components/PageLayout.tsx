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
  const navButtonClass =
    "inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-secondary/30 bg-brand-primary-soft px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-brand-secondary hover:border-brand-secondary hover:bg-white transition";

  return (
    <main className="min-h-screen bg-brand-background px-3 py-4 sm:px-8 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="rounded-2xl sm:rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex flex-row items-center gap-2 sm:gap-4 bg-brand-primary px-3 sm:px-5 py-3 sm:py-4">
            <Image
              src="/College%20Logo.png"
              width={72}
              height={72}
              alt="Sri Shakthi Institute logo"
              className="h-10 w-10 sm:h-16 sm:w-16 object-contain flex-shrink-0"
              priority
            />
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-xl md:text-2xl font-extrabold text-brand-secondary uppercase tracking-wide leading-tight">
                Sri Shakthi Institute of Engineering and Technology
              </p>
              <p className="text-[10px] sm:text-sm font-semibold text-brand-secondaryDark/80 mt-0.5 sm:mt-1">
                An Autonomous Institution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 border-t border-brand-secondary/20 bg-brand-primary-soft px-3 sm:px-5 py-2 sm:py-4">
            {showBackButton && (
              <Link href={backHref} className={navButtonClass}>
                ← Back
              </Link>
            )}
            <Link href="/" className={navButtonClass}>
              ⌂ Home
            </Link>
          </div>
        </div>

        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
};
