"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getClassesByDepartment } from "@/data/mockDatabase";

export default function StaffClassPeriod() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [periodDuration, setPeriodDuration] = useState<"45min" | "1hour" | "">("");
  const [numberOfPeriods, setNumberOfPeriods] = useState("");
  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  const semesters = [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
    { id: "3", name: "Semester 3" },
    { id: "4", name: "Semester 4" },
    { id: "5", name: "Semester 5" },
    { id: "6", name: "Semester 6" },
    { id: "7", name: "Semester 7" },
    { id: "8", name: "Semester 8" },
  ];

  useEffect(() => {
    const dept = sessionStorage.getItem("selectedDepartment");
    if (!sessionStorage.getItem("staffName") || !sessionStorage.getItem("selectedBatch") || !dept) {
      router.push("/staff/validate");
      return;
    }

    // Load classes
    const classes = getClassesByDepartment(dept);
    setAvailableClasses(classes);
  }, [router]);

  const handleDurationSelect = (duration: "45min" | "1hour") => {
    setPeriodDuration(duration);
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClass) {
      newErrors.class = "Please select a class";
    }
    
    if (!selectedSemester) {
      newErrors.semester = "Please select a semester";
    }

    if (!periodDuration) {
      newErrors.duration = "Please select period duration";
    }
    
    const periodCount = parseInt(numberOfPeriods);
    if (!numberOfPeriods || isNaN(periodCount) || periodCount < 1) {
      newErrors.periods = "Please enter a valid number of periods (minimum 1)";
    } else if (periodCount > 8) {
      newErrors.periods = "Maximum 8 periods allowed";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem("selectedClass", selectedClass);
    sessionStorage.setItem("selectedSemester", selectedSemester);
    sessionStorage.setItem("periodDuration", periodDuration);
    sessionStorage.setItem("numberOfPeriods", numberOfPeriods);
    router.push("/staff/mark-attendance");
  };

  return (
    <PageLayout
      title="Select Class & Period"
      subtitle="Choose class and number of periods"
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

          <Select
            label="Semester"
            value={selectedSemester}
            onChange={setSelectedSemester}
            options={semesters}
            placeholder="Select semester"
            required
            error={errors.semester}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-secondary mb-3">
              Period Duration <span className="text-status-danger">*</span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDurationSelect("45min")}
                className={`
                  px-4 py-4 border-2 font-medium text-center rounded-2xl transition
                  ${
                    periodDuration === "45min"
                      ? 'bg-brand-primary text-brand-secondary border-brand-secondary shadow-sm'
                      : 'bg-brand-surface border-neutral-border text-neutral-primary hover:border-brand-secondary/60'
                  }
                `}
              >
                <p className={`text-base font-bold ${
                  periodDuration === "45min" ? 'text-brand-secondary' : 'text-neutral-primary'
                }`}>
                  45 Minutes
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => handleDurationSelect("1hour")}
                className={`
                  px-4 py-4 border-2 font-medium text-center rounded-2xl transition
                  ${
                    periodDuration === "1hour"
                      ? 'bg-brand-primary text-brand-secondary border-brand-secondary shadow-sm'
                      : 'bg-brand-surface border-neutral-border text-neutral-primary hover:border-brand-secondary/60'
                  }
                `}
              >
                <p className={`text-base font-bold ${
                  periodDuration === "1hour" ? 'text-brand-secondary' : 'text-neutral-primary'
                }`}>
                  1 Hour
                </p>
              </button>
            </div>
            
            {errors.duration && (
              <p className="mt-2 text-sm text-status-danger">
                {errors.duration}
              </p>
            )}
          </div>

          <Input
            label="Number of Periods"
            type="number"
            value={numberOfPeriods}
            onChange={setNumberOfPeriods}
            placeholder="Enter number of periods (1-8)"
            required
            error={errors.periods}
            min={1}
            max={8}
          />

          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
