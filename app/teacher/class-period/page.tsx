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
            
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Current Time:</strong> {currentTime} • Click periods to select/deselect.
              </p>
            </div>

            {/* Period Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {periods.map((period) => {
                const isSelected = selectedPeriods.includes(period.id);
                return (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => handlePeriodToggle(period.id, !isSelected)}
                    className={`
                      px-4 py-4 border-2 font-medium text-center
                      ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
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
                  </button>
                );
              })}
            </div>
            
            {/* Selection Summary */}
            {selectedPeriods.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200">
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
              <p className="mt-2 text-sm text-red-500">
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
