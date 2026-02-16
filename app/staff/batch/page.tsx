"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getBatches, getDepartments } from "@/data/mockDatabase";

export default function StaffBatch() {
  const router = useRouter();
  const [staffName, setStaffName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const batches = getBatches();
  const departments = getDepartments();
  const steps = ["Staff ID", "Batch & Dept", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    const name = sessionStorage.getItem("staffName");
    if (!name) {
      router.push("/staff/validate");
      return;
    }
    setStaffName(name);
  }, [router]);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedBatch) newErrors.batch = "Please select a batch";
    if (!selectedDepartment) newErrors.department = "Please select a department";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem("selectedBatch", selectedBatch);
    sessionStorage.setItem("selectedDepartment", selectedDepartment);
    router.push("/staff/class-period");
  };

  return (
    <PageLayout
      title="Select Batch & Department"
      subtitle={`Welcome, ${staffName}`}
    >
      <ProgressIndicator currentStep={2} totalSteps={5} steps={steps} />

      <Card>
        <div className="space-y-6">
          <Select
            label="Batch"
            value={selectedBatch}
            onChange={(val) => { setSelectedBatch(val); setErrors(prev => ({...prev, batch: ""})); }}
            options={batches}
            placeholder="Select batch"
            required
            error={errors.batch}
          />

          <Select
            label="Department"
            value={selectedDepartment}
            onChange={(val) => { setSelectedDepartment(val); setErrors(prev => ({...prev, department: ""})); }}
            options={departments}
            placeholder="Select department"
            required
            error={errors.department}
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
