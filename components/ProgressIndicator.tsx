import React from "react";
import { appTheme } from "@/styles/theme";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex bg-pastel-blue rounded-full">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-secondary"
          ></div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                style={
                  isCompleted || isCurrent
                    ? {
                        backgroundColor: appTheme.brand.secondary,
                        color: appTheme.brand.surface,
                        borderColor: appTheme.brand.secondary,
                      }
                    : undefined
                }
                className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full border-2 ${
                  isCompleted
                    ? "shadow-sm"
                    : isCurrent
                    ? "shadow-sm"
                    : "bg-brand-surface text-neutral-muted border-neutral-border"
                }`}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <p
                className={`text-xs mt-2 text-center hidden sm:block ${
                  isCurrent ? "text-brand-secondary font-medium" : "text-neutral-muted"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
