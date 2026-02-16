"use client";

import React, { useState } from "react";
import { Period } from "@/types";
import { PeriodConfig, Break, formatTimeForDisplay } from "@/data/periodConfigs";
import { getCurrentPeriod } from "@/utils/periodDetection";
import { appTheme } from "@/styles/theme";

interface PeriodSelectorProps {
  config: PeriodConfig;
  onSelect: (startId: number, endId: number) => void;
  value: { start: number | null; end: number | null };
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  config,
  onSelect,
  value,
}) => {
  const [selectionStart, setSelectionStart] = useState<number | null>(value.start);
  const [hoverPeriod, setHoverPeriod] = useState<number | null>(null);

  const currentPeriod = getCurrentPeriod(config);
  const currentPeriodId = currentPeriod?.id || null;

  // Create a unified timeline with periods and breaks
  const timeline: Array<{ type: "period"; data: Period } | { type: "break"; data: Break }> = [];
  
  config.periods.forEach((period, index) => {
    timeline.push({ type: "period", data: period });
    
    // Check if there's a break after this period
    const breakAfter = config.breaks.find(
      (b) => b.startTime === period.endTime
    );
    
    if (breakAfter) {
      timeline.push({ type: "break", data: breakAfter });
    }
  });

  const handlePeriodClick = (periodId: number) => {
    if (selectionStart === null) {
      // First click - set start
      setSelectionStart(periodId);
      onSelect(periodId, periodId);
    } else {
      // Second click - set end
      const start = Math.min(selectionStart, periodId);
      const end = Math.max(selectionStart, periodId);
      onSelect(start, end);
      setSelectionStart(null); // Reset for next selection
    }
  };

  const isPeriodSelected = (periodId: number): boolean => {
    if (value.start === null || value.end === null) return false;
    return periodId >= value.start && periodId <= value.end;
  };

  const isPeriodInHoverRange = (periodId: number): boolean => {
    if (selectionStart === null || hoverPeriod === null) return false;
    const start = Math.min(selectionStart, hoverPeriod);
    const end = Math.max(selectionStart, hoverPeriod);
    return periodId >= start && periodId <= end;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-secondary">
        <p className="font-medium mb-2">
          {selectionStart === null
            ? "Click a period to start selection, then click another to complete the range"
            : "Click another period to complete your selection"}
        </p>
      </div>

      {/* Period Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {timeline.map((item, index) => {
          if (item.type === "break") {
            const breakData = item.data as Break;
            return (
              <div
                key={`break-${index}`}
                className="relative bg-neutral-border/20 border-2 border-neutral-border/40 rounded-xl p-3 text-center"
                style={{ borderStyle: "dashed" }}
              >
                <div className="text-xs font-semibold text-neutral-secondary mb-1">
                  {breakData.name}
                </div>
                <div className="text-[10px] text-neutral-secondary/70">
                  {formatTimeForDisplay(breakData.startTime)} - {formatTimeForDisplay(breakData.endTime)}
                </div>
                <div className="text-[9px] text-neutral-secondary/60 mt-0.5">
                  ({breakData.duration} mins)
                </div>
              </div>
            );
          } else {
            const period = item.data as Period;
            const isSelected = isPeriodSelected(period.id);
            const isCurrent = currentPeriodId === period.id;
            const isInHoverRange = isPeriodInHoverRange(period.id);
            const isSelectionStart = selectionStart === period.id;

            return (
              <button
                key={period.id}
                type="button"
                onClick={() => handlePeriodClick(period.id)}
                onMouseEnter={() => setHoverPeriod(period.id)}
                onMouseLeave={() => setHoverPeriod(null)}
                className={`
                  relative rounded-xl p-3 text-center font-medium transition-all duration-200
                  border-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-1
                  ${
                    isSelected
                      ? "bg-brand-secondary text-white border-brand-secondary shadow-md scale-105"
                      : isInHoverRange
                      ? "bg-brand-primarySoft border-brand-secondary text-brand-secondary"
                      : isCurrent
                      ? "bg-status-successSoft border-status-success text-status-successStrong animate-pulse"
                      : "bg-white border-brand-secondary/30 text-brand-secondary hover:border-brand-secondary hover:shadow-sm"
                  }
                `}
                style={{
                  minHeight: "80px",
                }}
              >
                {/* Current Period Badge */}
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-status-success text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    NOW
                  </div>
                )}

                {/* Selection Start Badge */}
                {isSelectionStart && !isSelected && (
                  <div className="absolute -top-2 -left-2 bg-brand-secondary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    START
                  </div>
                )}

                <div className="text-sm font-bold mb-1">{period.name}</div>
                <div className="text-[10px] opacity-90">
                  {formatTimeForDisplay(period.startTime)}
                </div>
                <div className="text-[10px] opacity-90">
                  {formatTimeForDisplay(period.endTime)}
                </div>
              </button>
            );
          }
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-secondary pt-2 border-t border-neutral-border">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-brand-secondary/30 bg-white"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-brand-secondary bg-brand-secondary"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-status-success bg-status-successSoft"></div>
          <span>Current Period</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-neutral-border/40 bg-neutral-border/20" style={{ borderStyle: "dashed" }}></div>
          <span>Break Time</span>
        </div>
      </div>
    </div>
  );
};
