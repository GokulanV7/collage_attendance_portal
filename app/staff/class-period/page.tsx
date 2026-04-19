"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { PeriodSelector } from "@/components/PeriodSelector";
import { getClassesByDepartment, getSubjectsByDepartment } from "@/data/mockDatabase";
import { getPeriodConfig } from "@/data/periodConfigs";
import { Subject } from "@/types";

export default function StaffClassPeriod() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [periodDuration, setPeriodDuration] = useState<45 | 60 | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<{ start: number | null; end: number | null }>({ 
    start: null, 
    end: null 
  });
  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Staff ID", "Batch & Dept", "Class & Period", "Mark", "Confirm"];

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
    const batch = sessionStorage.getItem("selectedBatch");
    if (!sessionStorage.getItem("staffName") || !batch || !dept) {
      router.push("/");
      return;
    }

    // Load classes
    const classes = getClassesByDepartment(batch, dept);
    setAvailableClasses(classes);
    
    // Load subjects based on department
    const subjects = getSubjectsByDepartment(dept);
    setAvailableSubjects(subjects);
  }, [router]);

  const handleDurationSelect = (duration: 45 | 60) => {
    setPeriodDuration(duration);
    // Reset period selection when duration changes
    setSelectedPeriods({ start: null, end: null });
  };

  const handlePeriodSelection = (start: number, end: number) => {
    setSelectedPeriods({ start, end });
    setErrors({ ...errors, periods: "" });
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClass) {
      newErrors.class = "Please select a class";
    }
    
    if (!selectedSemester) {
      newErrors.semester = "Please select a semester";
    }

    if (!selectedSubject) {
      newErrors.subject = "Please select a subject";
    }

    if (!periodDuration) {
      newErrors.duration = "Please select period duration";
    }
    
    if (selectedPeriods.start === null || selectedPeriods.end === null) {
      newErrors.periods = "Please select period(s) for attendance";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Find selected subject details
    const subjectDetails = availableSubjects.find(s => s.id === selectedSubject);

    sessionStorage.setItem("selectedClass", selectedClass);
    sessionStorage.setItem("selectedSemester", selectedSemester);
    sessionStorage.setItem("selectedSubject", subjectDetails?.name || "");
    sessionStorage.setItem("selectedSubjectCode", subjectDetails?.code || "");
    sessionStorage.setItem("periodDuration", periodDuration!.toString());
    sessionStorage.setItem("selectedPeriodStart", selectedPeriods.start!.toString());
    sessionStorage.setItem("selectedPeriodEnd", selectedPeriods.end!.toString());
    router.push("/staff/mark-attendance");
  };

  return (
    <PageLayout
      title="Select Class & Period"
      subtitle="Choose class and number of periods"
    >
      <ProgressIndicator currentStep={3} totalSteps={5} steps={steps} />

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

          <Select
            label="Subject"
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={availableSubjects.map(s => ({ id: s.id, name: `${s.name} (${s.code})` }))}
            placeholder="Select subject"
            required
            error={errors.subject}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-secondary mb-3">
              Period Duration <span className="text-status-danger">*</span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDurationSelect(45)}
                className={`
                  px-4 py-4 border-2 font-medium text-center rounded-2xl transition
                  ${
                    periodDuration === 45
                      ? 'bg-brand-primary text-brand-secondary border-brand-secondary shadow-sm'
                      : 'bg-brand-surface border-neutral-border text-neutral-primary hover:border-brand-secondary/60'
                  }
                `}
              >
                <p className={`text-base font-bold ${
                  periodDuration === 45 ? 'text-brand-secondary' : 'text-neutral-primary'
                }`}>
                  45 Minutes
                </p>
                <p className="text-xs text-neutral-secondary mt-1">8 periods/day</p>
              </button>
              
              <button
                type="button"
                onClick={() => handleDurationSelect(60)}
                className={`
                  px-4 py-4 border-2 font-medium text-center rounded-2xl transition
                  ${
                    periodDuration === 60
                      ? 'bg-brand-primary text-brand-secondary border-brand-secondary shadow-sm'
                      : 'bg-brand-surface border-neutral-border text-neutral-primary hover:border-brand-secondary/60'
                  }
                `}
              >
                <p className={`text-base font-bold ${
                  periodDuration === 60 ? 'text-brand-secondary' : 'text-neutral-primary'
                }`}>
                  1 Hour
                </p>
                <p className="text-xs text-neutral-secondary mt-1">7 periods/day</p>
              </button>
            </div>
            
            {errors.duration && (
              <p className="mt-2 text-sm text-status-danger">
                {errors.duration}
              </p>
            )}
          </div>

          {/* Period Selection */}
          {periodDuration && (
            <div>
              <label className="block text-sm font-medium text-neutral-secondary mb-3">
                Select Period(s) <span className="text-status-danger">*</span>
              </label>
              <PeriodSelector
                config={getPeriodConfig(periodDuration)}
                onSelect={handlePeriodSelection}
                value={selectedPeriods}
              />
              {errors.periods && (
                <p className="mt-2 text-sm text-status-danger">
                  {errors.periods}
                </p>
              )}
            </div>
          )}

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
