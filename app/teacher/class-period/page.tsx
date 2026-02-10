"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getClassesByDepartment } from "@/data/mockDatabase";
import { getPeriods } from "@/data/mockStaffAndPeriods";
import { getDefaultPeriod, formatPeriodTime, getCurrentTime } from "@/utils/periodDetection";

export default function TeacherClassPeriod() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState("");

  const periods = getPeriods();
  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    const dept = sessionStorage.getItem("selectedDepartment");
    if (!sessionStorage.getItem("staffName") || !sessionStorage.getItem("selectedBatch") || !dept) {
      router.push("/teacher/validate");
      return;
    }

    // Load classes
    const classes = getClassesByDepartment(dept);
    setAvailableClasses(classes);

    // Set current time
    setCurrentTime(getCurrentTime());

    // Auto-select default period
    const defaultPeriod = getDefaultPeriod();
    if (defaultPeriod) {
      setSelectedPeriods([defaultPeriod]);
    }
  }, [router]);

  const handlePeriodToggle = (periodId: number, checked: boolean) => {
    if (checked) {
      setSelectedPeriods([...selectedPeriods, periodId]);
    } else {
      setSelectedPeriods(selectedPeriods.filter(p => p !== periodId));
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClass) {
      newErrors.class = "Please select a class";
    }
    if (selectedPeriods.length === 0) {
      newErrors.periods = "Please select at least one period";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem("selectedClass", selectedClass);
    sessionStorage.setItem("selectedPeriods", JSON.stringify(selectedPeriods));
    router.push("/teacher/mark-attendance");
  };

  return (
    <PageLayout
      title="Select Class & Period"
      subtitle="Choose class and teaching periods"
      showBackButton
      backHref="/teacher/department"
    >
      <ProgressIndicator currentStep={4} totalSteps={6} steps={steps} />

      <Card>
        <div className="space-y-6">
          <Select
            label="Class"
            value={selectedClass}
            onChange={setSelectedClass}
            options={availableClasses}
            placeholder="Select class"
            required
            error={errors.class}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Teaching Period(s) <span className="text-red-500">*</span>
            </label>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  <strong>Current Time:</strong> {currentTime} • Click periods to select/deselect. You can mark attendance for multiple periods.
                </p>
              </div>
            </div>

            {/* Period Selection Grid - Theater Booking Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300">
              {periods.map((period) => {
                const isSelected = selectedPeriods.includes(period.id);
                return (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => handlePeriodToggle(period.id, !isSelected)}
                    className={`
                      relative group overflow-hidden
                      px-4 py-6 rounded-xl border-2 font-medium
                      transition-all duration-300 transform
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-700 text-white shadow-lg scale-105 ring-2 ring-primary-300'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:shadow-md hover:scale-102'
                      }
                    `}
                  >
                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Period Icon */}
                    <div className={`mb-2 ${
                      isSelected ? 'text-white' : 'text-primary-600'
                    }`}>
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    
                    {/* Period Name */}
                    <div className="text-center">
                      <p className={`text-sm font-bold mb-1 ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}>
                        {period.name}
                      </p>
                      <p className={`text-xs ${
                        isSelected ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {period.startTime} - {period.endTime}
                      </p>
                    </div>

                    {/* Hover Effect Overlay */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Selection Summary */}
            {selectedPeriods.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>{selectedPeriods.length} period(s) selected:</strong>{' '}
                  {periods
                    .filter(p => selectedPeriods.includes(p.id))
                    .map(p => p.name)
                    .join(', ')}
                </p>
              </div>
            )}
            
            {errors.periods && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.periods}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Next: Mark Attendance
            </Button>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
