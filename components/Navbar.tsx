"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { appTheme } from "@/styles/theme";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: "⌂" },
    { href: "/staff/validate", label: "Mark Attendance", icon: "✓" },
    { href: "/admin/view", label: "View Records", icon: "📋" },
    { href: "/admin/login", label: "Admin", icon: "⚙" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className="rounded-2xl sm:rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden"
      style={{ borderColor: `${appTheme.brand.secondary}40` }}
    >
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-brand-primary px-3 sm:px-5 py-3 sm:py-4">
        {/* Logo and Title */}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-brand-secondary text-white border-brand-secondary shadow-md"
                  : "bg-white text-brand-secondary border-brand-secondary/30 hover:border-brand-secondary hover:shadow-sm"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-brand-secondary/30 bg-white text-brand-secondary hover:border-brand-secondary transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-brand-secondary/20 bg-brand-primarySoft">
          <div className="flex flex-col p-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-brand-secondary text-white border-brand-secondary shadow-md"
                    : "bg-white text-brand-secondary border-brand-secondary/30 hover:border-brand-secondary"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
