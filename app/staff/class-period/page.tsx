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

export default function StaffClassPeriod() {
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
      router.push("/staff/validate");
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
    router.push("/staff/mark-attendance");
  };

  return (
    <PageLayout
      title="Select Class & Period"
      subtitle="Choose class and teaching periods"
      showBackButton
      backHref="/staff/department"
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
            <label className="block text-sm font-medium text-neutral-secondary mb-3">
              Select Teaching Period(s) <span className="text-status-danger">*</span>
            </label>
            
            <div className="bg-brand-primarySoft border border-brand-primary/40 p-4 mb-4 rounded-2xl">
              <p className="text-sm text-brand-secondary">
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
                      px-4 py-4 border-2 font-medium text-center rounded-2xl transition
                      ${
                        isSelected
                          ? 'bg-brand-primary text-brand-secondary border-brand-secondary shadow-sm'
                          : 'bg-brand-surface border-neutral-border text-neutral-primary hover:border-brand-secondary/60'
                      }
                    `}
                  >
                    <p className={`text-sm font-bold mb-1 ${
                      isSelected ? 'text-brand-secondary' : 'text-neutral-primary'
                    }`}>
                      {period.name}
                    </p>
                    <p className={`text-xs ${
                      isSelected ? 'text-brand-secondary/80' : 'text-neutral-muted'
                    }`}>
                      {period.startTime} - {period.endTime}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* Selection Summary */}
            {selectedPeriods.length > 0 && (
              <div className="mt-4 p-3 bg-status-successSoft border border-status-success rounded-2xl">
                <p className="text-sm text-status-successStrong">
                  <strong>{selectedPeriods.length} period(s) selected:</strong>{' '}
                  {periods
                    .filter(p => selectedPeriods.includes(p.id))
                    .map(p => p.name)
                    .join(', ')}
                </p>
              </div>
            )}
            
            {errors.periods && (
              <p className="mt-2 text-sm text-status-danger">
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
