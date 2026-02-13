"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { validateStaffId } from "@/data/mockStaffAndPeriods";

export default function StaffValidate() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");

  const handleValidate = () => {
    if (!staffId.trim()) {
      setError("Staff ID is required");
      return;
    }

    const staff = validateStaffId(staffId.trim());
    
    if (!staff) {
      setError("Invalid Staff ID. Please try again.");
      return;
    }

    // Store staff info in sessionStorage
    sessionStorage.setItem("staffId", staff.id);
    sessionStorage.setItem("staffName", staff.name);
    sessionStorage.setItem("staffDepartment", staff.department);

    // Navigate to batch selection
    router.push("/staff/batch");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  return (
    <PageLayout
      title="Staff Portal"
      subtitle="Validate your Staff ID to continue"
      showBackButton
      backHref="/"
    >
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
            placeholder="e.g., STAFF001"
            required
            error={error}
            type="text"
          />

          <div className="bg-status-infoSoft border border-status-info p-3 rounded-2xl">
            <p className="text-sm text-status-infoStrong">
              <strong>Sample Staff IDs:</strong> STAFF001, STAFF002, STAFF003,
              STAFF004, STAFF005
            </p>
          </div>

          <Button onClick={handleValidate} fullWidth>
            Validate & Continue
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
}
