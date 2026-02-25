"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { validateStaffId } from "@/data/mockStaffAndPeriods";

export default function Home() {
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

    setTimeout(() => {
      const staff = validateStaffId(staffId.trim());

      if (!staff) {
        setError("Invalid Staff ID. Please try again.");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("staffId", staff.id);
      sessionStorage.setItem("staffName", staff.name);
      sessionStorage.setItem("staffDepartment", staff.department);

      router.push("/staff/batch");
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleValidate();
    }
  };

  return (
    <main className="min-h-screen bg-brand-background flex flex-col items-center px-3 py-0 sm:px-8 sm:py-0">
      {/* College Header Banner - Fixed at top */}
      <div className="w-full sticky top-0 z-10 pt-3 sm:pt-4 pb-2 bg-brand-background">
        <Navbar />
      </div>

      <div className="w-full max-w-md space-y-6 flex-1 flex flex-col justify-center py-4 sm:py-6">
        {isLoading && <LoadingSpinner message="Validating Staff ID..." />}
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-neutral-primary">
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
      </div>

      {/* Admin - Subtle icon in bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/admin/login"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-primary/5 hover:bg-neutral-primary/10 border border-neutral-border/40 hover:border-neutral-border transition-all group"
          title="Admin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-secondary/40 group-hover:text-neutral-secondary/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
