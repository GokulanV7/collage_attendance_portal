"use client";

import React, { useState } from "react";

interface TopNavbarProps {
  deptName: string;
  onSearch: (query: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ deptName, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="ui-panel flex min-h-16 flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-primary" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            {deptName || "Admin Dashboard"}
          </h1>
          <p className="text-xs text-neutral-secondary">
            Welcome back, Admin
          </p>
        </div>
      </div>

      <div className="w-full max-w-xl sm:mx-0 sm:flex-1">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search students, roll numbers..."
            value={searchQuery}
            onChange={handleSearch}
            className="ui-focus-ring w-full rounded-xl border border-neutral-border bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-neutral-primary placeholder-neutral-muted"
          />
        </div>
      </div>

      <div className="hidden w-8 lg:block"></div>
    </header>
  );
};
