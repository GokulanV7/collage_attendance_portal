"use client";

import React, { useState } from "react";

export interface FilterState {
  batch: string;
  className: string;
  semester: string;
  subject: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  batchOptions: string[];
  classOptions: string[];
  semesterOptions: string[];
  subjectOptions: string[];
  onExport: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  batchOptions,
  classOptions,
  semesterOptions,
  subjectOptions,
  onExport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      batch: batchOptions[0] || "",
      className: classOptions[0] || "",
      semester: semesterOptions[0] || "",
      subject: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
  };

  const activeFiltersCount = [
    filters.subject,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-border/50 p-4">
      {/* Primary Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Batch */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-neutral-secondary mb-1">Academic Year</label>
          <select
            value={filters.batch}
            onChange={(e) => updateFilter("batch", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
          >
            {batchOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-neutral-secondary mb-1">Class</label>
          <select
            value={filters.className}
            onChange={(e) => updateFilter("className", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
          >
            <option value="">All Classes</option>
            {classOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-neutral-secondary mb-1">Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => updateFilter("semester", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
          >
            <option value="">All Semesters</option>
            {semesterOptions.map((opt) => (
              <option key={opt} value={opt}>Semester {opt}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-neutral-secondary mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="On-Duty">On-Duty</option>
          </select>
        </div>

        {/* Expand/Collapse Button */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-100 text-neutral-secondary rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            More Filters
            {activeFiltersCount > 0 && (
              <span className="bg-brand-secondary text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium hover:bg-brand-secondaryDark transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-border/50">
          <div className="flex flex-wrap items-end gap-3">
            {/* Subject */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-neutral-secondary mb-1">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => updateFilter("subject", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              >
                <option value="">All Subjects</option>
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-neutral-secondary mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            {/* Date To */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-neutral-secondary mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-neutral-secondary mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Student name or roll no..."
                className="w-full px-3 py-2 bg-gray-50 border border-neutral-border/50 rounded-lg text-sm text-neutral-primary placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-neutral-border text-neutral-secondary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
