import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar: React.FC = () => {
  return (
    <nav className="ui-panel rounded-3xl">
      <div className="flex flex-row items-center justify-between gap-3 rounded-3xl bg-brand-primary px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 flex-row items-center gap-3 sm:gap-4">
          <Image
            src="/College Logo.png"
            width={72}
            height={72}
            alt="Sri Shakthi Institute logo"
            className="h-10 w-10 flex-shrink-0 rounded-xl border border-brand-secondary/25 bg-white/55 p-1 object-contain sm:h-14 sm:w-14"
            priority
          />
          <div className="min-w-0 text-left">
            <p
              className="line-clamp-2 text-[11px] font-extrabold uppercase leading-tight tracking-wide text-brand-secondary sm:text-sm md:text-base"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Sri Shakthi Institute of Engineering and Technology
            </p>
            <p className="mt-1 text-[10px] font-semibold text-brand-secondaryDark/80 sm:text-xs">
              Empowering the Youth | Empowering the Nation
            </p>
          </div>
        </Link>

        <div className="hidden rounded-xl border border-brand-secondary/25 bg-white/60 px-3 py-1.5 text-xs font-semibold text-brand-secondary lg:block">
          Attendance Portal
        </div>
      </div>
    </nav>
  );
};
