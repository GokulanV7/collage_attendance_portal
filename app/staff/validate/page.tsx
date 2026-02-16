"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { validateStaffId } from "@/data/mockStaffAndPeriods";

export default function StaffValidate() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = () => {
    if (!staffId.trim()) {
      setError("Staff ID is required");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate validation delay
    setTimeout(() => {
      const staff = validateStaffId(staffId.trim());
      
      if (!staff) {
        setError("Invalid Staff ID. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store staff info in sessionStorage
      sessionStorage.setItem("staffId", staff.id);
      sessionStorage.setItem("staffName", staff.name);
      sessionStorage.setItem("staffDepartment", staff.department);

      // Navigate to batch selection
      router.push("/staff/batch");
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleValidate();
    }
  };

  return (
    <PageLayout
      title="Attendance Portal"
      subtitle="Validate your Staff ID to continue"
    >
      {isLoading && <LoadingSpinner message="Validating Staff ID..." />}
      <Card className="max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-primary">
              Staff Authentication
            </h2>
            <p className="text-sm text-neutral-secondary mt-1">
              Enter your Staff ID to access the attendance system
            </p>
          </div>

          <Input
            label="Staff ID"
            value={staffId}
            onChange={setStaffId}
            onKeyPress={handleKeyPress}
            placeholder="e.g., STAFF001"
            required
            error={error}
            type="text"
            disabled={isLoading}
          />

          <div className="bg-status-infoSoft border border-status-info p-3 rounded-2xl">
            <p className="text-sm text-status-infoStrong">
              <strong>Sample Staff IDs:</strong> STAFF001, STAFF002, STAFF003,
              STAFF004, STAFF005
            </p>
          </div>

          <Button onClick={handleValidate} fullWidth disabled={isLoading}>
            {isLoading ? "Validating..." : "Validate & Continue"}
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
}
