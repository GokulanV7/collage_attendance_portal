import React from "react";
import Link from "next/link";
import Image from "next/image";
import { appTheme } from "@/styles/theme";

export const Navbar: React.FC = () => {
  return (
    <nav
      className="rounded-2xl sm:rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden"
      style={{ borderColor: `${appTheme.brand.secondary}40` }}
    >
      <div className="flex flex-row items-center gap-2 sm:gap-4 bg-brand-primary px-3 sm:px-5 py-3 sm:py-4">
        <Link href="/" className="flex flex-row items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Image
            src="/College%20Logo.png"
            width={72}
            height={72}
            alt="Sri Shakthi Institute logo"
            className="h-10 w-10 sm:h-14 sm:w-14 object-contain flex-shrink-0"
            priority
          />
          <div className="text-left min-w-0">
            <p className="text-xs sm:text-lg md:text-xl font-extrabold text-brand-secondary uppercase tracking-wide leading-tight truncate">
              Sri Shakthi Institute of Engineering and Technology
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-brand-secondaryDark/80 mt-0.5">
              Attendance Management System
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
};
