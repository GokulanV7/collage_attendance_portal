import React from "react";

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
        <div className="overflow-hidden h-2 mb-4 text-xs flex bg-gray-200">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
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
                className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? "bg-primary-600 text-white"
                    : isCurrent
                    ? "bg-primary-600 text-white border-2 border-primary-300"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <p
                className={`text-xs mt-2 text-center hidden sm:block ${
                  isCurrent ? "text-primary-600 font-medium" : "text-gray-500"
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
