"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { getBatches } from "@/data/mockDatabase";

export default function TeacherBatch() {
  const router = useRouter();
  const [staffName, setStaffName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [error, setError] = useState("");

  const batches = getBatches();
  const steps = ["Staff ID", "Batch", "Department", "Class & Period", "Mark", "Confirm"];

  useEffect(() => {
    // Check if staff is validated
    const name = sessionStorage.getItem("staffName");
    if (!name) {
      router.push("/teacher/validate");
      return;
    }
    setStaffName(name);
  }, [router]);

  const handleNext = () => {
    if (!selectedBatch) {
      setError("Please select a batch");
      return;
    }

    sessionStorage.setItem("selectedBatch", selectedBatch);
    router.push("/teacher/department");
  };

  return (
    <PageLayout
      title="Select Batch"
      subtitle={`Welcome, ${staffName}`}
      showBackButton
      backHref="/teacher/validate"
    >
      <ProgressIndicator currentStep={2} totalSteps={6} steps={steps} />

      <Card>
        <div className="space-y-6">
          <Select
            label="Batch"
            value={selectedBatch}
            onChange={setSelectedBatch}
            options={batches}
            placeholder="Select batch"
            required
            error={error}
          />

          <div className="bg-pastel-blue p-4 rounded-2xl border border-neutral-border/60">
            <p className="text-sm text-neutral-secondary">
              <strong>Note:</strong> Select the academic batch for which you
              want to mark attendance.
            </p>
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
              Next
            </Button>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
