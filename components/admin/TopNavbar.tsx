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
    <header className="h-16 bg-white border-b border-neutral-border flex items-center justify-between px-6">
      {/* Left - Breadcrumb / Department */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-primary">
            {deptName || "Admin Dashboard"}
          </h1>
          <p className="text-xs text-neutral-secondary">
            Welcome back, Admin
          </p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-8">
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm text-neutral-primary placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
          />
        </div>
      </div>

      {/* Right - Spacer */}
      <div className="w-8"></div>
    </header>
  );
};
