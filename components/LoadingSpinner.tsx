import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl">
        <div className="relative">
          {/* Spinner */}
          <div className="lds-spinner text-brand-secondary">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {/* College Logo in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-neutral-secondary font-medium">{message}</p>
      </div>
    </div>
  );
}
