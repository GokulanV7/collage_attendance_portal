"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getDepartments } from "@/data/mockDatabase";

export default function TeacherDepartment() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [error, setError] = useState("");

  const departments = getDepartments();
  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    if (!sessionStorage.getItem("staffName") || !sessionStorage.getItem("selectedBatch")) {
      router.push("/teacher/validate");
    }
  }, [router]);

  const handleNext = () => {
    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }

    sessionStorage.setItem("selectedDepartment", selectedDepartment);
    router.push("/teacher/class-period");
  };

  return (
    <PageLayout
      title="Select Department"
      subtitle="Choose the department"
      showBackButton
      backHref="/teacher/batch"
    >
      <ProgressIndicator currentStep={3} totalSteps={6} steps={steps} />

      <Card>
        <div className="space-y-6">
          <Select
            label="Department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments}
            placeholder="Select department"
            required
            error={error}
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
