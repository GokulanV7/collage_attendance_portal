import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar: React.FC = () => {
  return (
    <nav>
      <div className="flex flex-row items-center gap-2 sm:gap-4 bg-brand-primary rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3">
        <Link href="/" className="flex flex-row items-center gap-2 sm:gap-4">
          <Image
            src="/College%20Logo.png"
            width={72}
            height={72}
            alt="Sri Shakthi Institute logo"
            className="h-9 w-9 sm:h-12 sm:w-12 object-contain flex-shrink-0"
            priority
          />
          <div className="text-left">
            <p className="text-[11px] sm:text-sm md:text-base font-extrabold text-brand-secondary uppercase tracking-wide leading-tight">
              Sri Shakthi Institute of Engineering and Technology
            </p>
            <p className="text-[9px] sm:text-[11px] font-semibold text-brand-secondaryDark/80 mt-0.5">
              Empowering the Youth • Empowering the Nation
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
};
